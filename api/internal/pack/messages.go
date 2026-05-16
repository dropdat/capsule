package pack

import (
	"encoding/json"
	"fmt"
	"strings"
)

type rawMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// renderMessages turns the JSONB messages array into a clean markdown log.
// Returns "" on parse error rather than erroring out — pack rendering should
// degrade gracefully when one capsule's payload is malformed.
func renderMessages(raw []byte) string {
	if len(raw) == 0 {
		return ""
	}
	var msgs []rawMessage
	if err := json.Unmarshal(raw, &msgs); err != nil {
		return ""
	}
	if len(msgs) == 0 {
		return ""
	}
	var b strings.Builder
	for _, m := range msgs {
		label := strings.ToUpper(m.Role[:1]) + m.Role[1:]
		if label == "" {
			label = "Message"
		}
		fmt.Fprintf(&b, "\n**%s:** %s\n", label, strings.TrimSpace(m.Content))
	}
	return b.String()
}
