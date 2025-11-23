package filter

import (
	"regexp"
	"strings"
)

// ProfanityFilter contains the filtering logic for inappropriate content
type ProfanityFilter struct {
	bannedWords []string
	patterns    []*regexp.Regexp
}

// NewProfanityFilter creates a new profanity filter with a comprehensive list of banned words
func NewProfanityFilter() *ProfanityFilter {
	filter := &ProfanityFilter{
		bannedWords: getBannedWords(),
	}

	// Compile regex patterns for banned words (case-insensitive, with word boundaries)
	for _, word := range filter.bannedWords {
		// Create pattern that matches the word with optional special characters
		pattern := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(word) + `\b`)
		filter.patterns = append(filter.patterns, pattern)

		// Also check for l33t speak and common substitutions
		substituted := applyCommonSubstitutions(word)
		if substituted != word {
			substPattern := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(substituted) + `\b`)
			filter.patterns = append(filter.patterns, substPattern)
		}
	}

	return filter
}

// ContainsProfanity checks if the given text contains profanity
func (pf *ProfanityFilter) ContainsProfanity(text string) bool {
	// Normalize the text - remove extra spaces, convert to lowercase for checking
	normalized := strings.ToLower(strings.TrimSpace(text))

	// Check against all patterns
	for _, pattern := range pf.patterns {
		if pattern.MatchString(normalized) {
			return true
		}
	}

	return false
}

// applyCommonSubstitutions applies common character substitutions used to bypass filters
func applyCommonSubstitutions(word string) string {
	substitutions := map[string]string{
		"a": "@",
		"e": "3",
		"i": "1",
		"o": "0",
		"s": "$",
		"t": "7",
	}

	result := word
	for original, substitute := range substitutions {
		result = strings.ReplaceAll(result, original, substitute)
	}

	return result
}

// getBannedWords returns a comprehensive list of inappropriate words
// This includes profanity, slurs, and racist terms
func getBannedWords() []string {
	return []string{
		// Common profanity (EN)
		"fuck", "shit", "damn", "bitch", "asshole", "bastard", "crap",
		"piss", "dickhead", "jackass", "dumbass", "bullshit",
		"motherfucker", "cocksucker", "son of a bitch", "piece of shit",

		// Sexual (EN)
		"porn", "sex", "naked", "nude", "xxx", "adult", "escort",

		// Racist slurs (EN)
		"nigger", "nigga", "negro", "spic", "wetback", "chink", "gook",
		"kike", "hymie", "raghead", "towelhead", "sand nigger",
		"cracker", "honky", "whitey", "gringo", "beaner", "border hopper",

		// Homophobic (EN)
		"faggot", "fag", "dyke", "homo", "queer", "tranny",

		// Religious slurs (EN)
		"christ killer", "jihad", "terrorist",

		// Disability slurs (EN)
		"retard", "retarded", "spastic", "cripple", "invalid",

		// Offensive (EN)
		"nazi", "hitler", "genocide", "kill yourself", "kys",
		"suicide", "die", "death", "murder", "rape",

		// Hate indicators (EN)
		"hate", "supremacy", "master race", "inferior race",
		"pure blood", "ethnic cleansing",

		// Drugs (EN)
		"cocaine", "heroin", "meth", "crack", "weed", "marijuana",
		"drugs", "dealer", "pusher",

		// Violence (EN)
		"violence", "beating", "assault", "abuse", "torture",
		"bomb", "explosion", "attack",

		// Spam (EN)
		"advertisement", "promotion", "scam", "phishing",

		// Variations (EN)
		"fuk", "shyt", "btch", "azz", "phuck", "biatch",
		"n1gger", "n1gga", "f4ggot", "f4g", "sh1t", "fck",

		// ---------------- PT-BR ----------------

		// Profanidade comum
		"porra", "caralho", "merda", "bosta", "droga",
		"puta", "puto", "putaria", "fdp", "filho da puta",
		"desgraça", "desgraçado", "inferno", "maldito",
		"cacete", "vtnc", "vtmnc", "vsf", "pqp",

		// Sexuais
		"sexo", "pornô", "porno", "nua", "nu", "nude", "nudes",
		"prostituta", "prostituto", "prostituição", "programa",
		"buceta", "xoxota", "xana", "xoxota", "peitos", "mamas",
		"pau", "rola", "pica", "boquete", "gozo", "gozar",

		// Homofóbicos
		"viado", "veado", "bicha", "sapatão", "traveco", "travec0",

		// Racistas (PT-BR) (atenção: usado para bloqueio, não para incentivo)
		"macaco", "neguinho", "criolo", "índio preguiçoso",

		// Xenófobos / étnicos
		"argentino imundo", "boliviano sujo",

		// Religiosos / intolerância
		"pastor safado", "crente fanático",

		// Capacitistas
		"mongoloide", "aleijado", "retardado", "debil mental",

		// Violência / autoagressão
		"se mata", "se mate", "morre", "morrer", "assassinato",
		"estupro", "estuprar", "suicídio", "suicidar", "matar",

		// Drogas (PT-BR)
		"maconha", "cannabis", "beck", "baseado", "cocaína",
		"heroína", "crack", "êxtase", "lança", "loló",

		// Ódio / supremacia
		"raça inferior", "raça superior", "sangue puro",

		// Spam / engano (PT-BR)
		"anúncio", "propaganda", "golpe", "fraude",

		// Abreviações / variações
		"f0da", "foda", "fodido", "fodida", "fuder", "fudido",
		"c@ralho", "p0rra", "p0ta", "p4u", "r0la", "cuzão",
		"arrombado", "otario", "otário", "idiota", "imbecil",
		"burro", "animal", "anta",

		// Leet / substituições PT
		"p0rra", "m3rda", "c4ralho", "d3sgraca", "f1lho da puta",
	}
}
