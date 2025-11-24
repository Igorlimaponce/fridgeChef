package chef

type GenerateRequest struct {
	Ingredients []string `json:"ingredients"`
	Preferences string   `json:"preferences"`
	Language    string   `json:"language"`
}

type GenerateResponse struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	Calories int    `json:"calories"`
}
