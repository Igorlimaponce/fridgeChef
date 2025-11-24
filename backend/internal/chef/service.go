package chef

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Igorlimaponce/fridgeChef/backend/internal/pantry"
	"github.com/google/uuid"
)

type ChefService struct {
	apiKey        string
	client        *http.Client
	pantryService *pantry.PantryService
}

func NewChefService(pantryService *pantry.PantryService) *ChefService {
	return &ChefService{
		apiKey:        os.Getenv("GEMINI_API_KEY"),
		client:        &http.Client{Timeout: 60 * time.Second},
		pantryService: pantryService,
	}
}

// Gemini API Structures
type geminiRequest struct {
	Contents []geminiContent `json:"contents"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func (s *ChefService) GenerateRecipe(ctx context.Context, userID uuid.UUID, req GenerateRequest) (*GenerateResponse, error) {
	if s.apiKey == "" {
		// Fallback to mock if no API key
		return s.generateMockRecipe(req)
	}

	// Fetch pantry items
	pantryItems, err := s.pantryService.List(ctx, userID)
	pantryStr := ""
	if err == nil && len(pantryItems) > 0 {
		var items []string
		for _, item := range pantryItems {
			items = append(items, item.Name)
		}
		pantryStr = fmt.Sprintf("The user also has these items in their pantry (use them if needed): %s.", strings.Join(items, ", "))
	}

	langInstruction := "Respond in English."
	if req.Language == "pt" {
		langInstruction = "Respond in Portuguese (pt-BR)."
	}

	prompt := fmt.Sprintf(`
You are a professional chef. Create a recipe using these main ingredients: %s.
%s
Preferences: %s.
%s
Return ONLY a JSON object (no markdown formatting) with this structure:
{
	"title": "Recipe Title",
	"content": "Markdown formatted content with Ingredients and Instructions",
	"calories": 500
}
`, strings.Join(req.Ingredients, ", "), pantryStr, req.Preferences, langInstruction)

	requestBody := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", s.apiKey)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call Gemini API: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Gemini API error: %s - %s", resp.Status, string(bodyBytes))
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no content returned from Gemini")
	}

	content := geminiResp.Candidates[0].Content.Parts[0].Text

	// Clean up potential markdown code blocks
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var result GenerateResponse
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		// Fallback if JSON parsing fails
		return &GenerateResponse{
			Title:    fmt.Sprintf("Recipe with %s", req.Ingredients[0]),
			Content:  content,
			Calories: 0,
		}, nil
	}

	return &result, nil
}
func (s *ChefService) generateMockRecipe(req GenerateRequest) (*GenerateResponse, error) {
	time.Sleep(2 * time.Second) // Simulate latency

	title := fmt.Sprintf("Delicious %s with %s", req.Preferences, strings.Join(req.Ingredients, ", "))
	if req.Preferences == "" {
		title = fmt.Sprintf("Delicious Dish with %s", strings.Join(req.Ingredients, ", "))
	}

	content := fmt.Sprintf(`
# %s

## Ingredients
%s

## Instructions
1. Prepare the ingredients.
2. Mix them together.
3. Cook for 20 minutes.
4. Serve hot.

Enjoy your meal!
`, title, formatIngredients(req.Ingredients))

	return &GenerateResponse{
		Title:    title,
		Content:  content,
		Calories: 450, // Mock value
	}, nil
}

func formatIngredients(ingredients []string) string {
	var sb strings.Builder
	for _, ing := range ingredients {
		sb.WriteString(fmt.Sprintf("- %s\n", ing))
	}
	return sb.String()
}
