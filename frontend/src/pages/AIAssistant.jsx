import { useEffect, useRef, useState } from "react";

const API_URL = "https://lifeguard-ai-ij32.onrender.com";

const STARTER_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm LifeGuard AI. I can help with wellness, sleep, stress, personal safety, family preparedness, and emergency preparedness. What can I help you with today?",
};

const suggestions = [
  {
    icon: "😊",
    label: "Daily wellness",
    prompt: "Give me some practical ideas to improve my daily wellness.",
  },
  {
    icon: "🌙",
    label: "Sleep",
    prompt: "How can I improve my sleep routine?",
  },
  {
    icon: "👨‍👩‍👧",
    label: "Family safety",
    prompt: "Help me create a family emergency preparedness plan.",
  },
  {
    icon: "🎒",
    label: "Emergency kit",
    prompt: "What should I keep in a basic emergency kit?",
  },
];

function AIAssistant() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("lifeguardUser");

    if (!savedUser) {
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (err) {
      console.error("Unable to read signed-in user:", err);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (messageText = input) => {
    const cleanedMessage = messageText.trim();

    if (!cleanedMessage || loading) {
      return;
    }

    if (!user?.email) {
      setError("Please sign in before using the LifeGuard AI Assistant.");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cleanedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(`${API_URL}/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          message: cleanedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "LifeGuard AI could not answer right now."
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data.reply ||
          "I couldn't generate a response. Please try again.",
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      console.error("AI Assistant error:", err);

      setError(
        err.message ||
          "LifeGuard AI could not connect to the assistant. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (event) => {
    setInput(event.target.value);

    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(
      event.target.scrollHeight,
      150
    )}px`;
  };

  const clearConversation = () => {
    setMessages([STARTER_MESSAGE]);
    setInput("");
    setError("");
  };

  return (
    <main className="ai-page">
      <section className="ai-hero">
        <div className="ai-container">
          <div className="ai-hero-content">
            <div className="ai-hero-icon">🤖</div>

            <div>
              <p className="ai-eyebrow">LIFEGUARD AI ASSISTANT</p>

              <h1>Your wellness & safety assistant</h1>

              <p className="ai-hero-description">
                Ask questions about wellness, sleep, personal safety,
                family preparedness, and emergency preparedness.
              </p>

              {user?.firstName && (
                <p className="ai-welcome">
                  Welcome, {user.firstName}.
                </p>
              )}
            </div>
          </div>

          <div className="ai-status">
            <span className="ai-status-dot"></span>
            AI Online
          </div>
        </div>
      </section>

      <section className="ai-workspace">
        <div className="ai-container ai-workspace-grid">
          <aside className="ai-sidebar">
            <div className="ai-sidebar-card">
              <p className="ai-eyebrow">TRY ASKING</p>

              <h2>How can I help?</h2>

              <div className="ai-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    className="ai-suggestion"
                    key={suggestion.label}
                    onClick={() => sendMessage(suggestion.prompt)}
                    disabled={loading}
                  >
                    <span className="ai-suggestion-icon">
                      {suggestion.icon}
                    </span>

                    <span>{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ai-sidebar-card ai-safety-card">
              <div className="ai-safety-icon">🛡️</div>

              <div>
                <h3>Safety first</h3>

                <p>
                  LifeGuard AI provides informational support. It does not
                  replace professional medical care or emergency responders.
                </p>
              </div>
            </div>
          </aside>

          <div className="ai-chat-card">
            <div className="ai-chat-header">
              <div className="ai-chat-identity">
                <div className="ai-avatar">🤖</div>

                <div>
                  <h2>LifeGuard AI</h2>
                  <p>
                    <span className="ai-status-dot"></span>
                    Online
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="ai-clear-button"
                onClick={clearConversation}
                disabled={loading}
              >
                Clear chat
              </button>
            </div>

            <div className="ai-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`ai-message-row ${
                    message.role === "user"
                      ? "ai-message-user"
                      : "ai-message-assistant"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="ai-message-avatar">🤖</div>
                  )}

                  <div className="ai-message-content">
                    <div className="ai-message-label">
                      {message.role === "user"
                        ? "You"
                        : "LifeGuard AI"}
                    </div>

                    <div className="ai-message-bubble">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="ai-message-row ai-message-assistant">
                  <div className="ai-message-avatar">🤖</div>

                  <div className="ai-message-content">
                    <div className="ai-message-label">
                      LifeGuard AI
                    </div>

                    <div className="ai-message-bubble ai-thinking">
                      <span></span>
                      <span></span>
                      <span></span>

                      <small>LifeGuard AI is thinking...</small>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="ai-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="ai-composer-area">
              <form
                className="ai-composer"
                onSubmit={handleSubmit}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask LifeGuard AI something..."
                  rows="1"
                  disabled={loading}
                  aria-label="Message LifeGuard AI"
                />

                <button
                  type="submit"
                  className="ai-send-button"
                  disabled={!input.trim() || loading}
                >
                  {loading ? "..." : "Send →"}
                </button>
              </form>

              <p className="ai-composer-hint">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-disclaimer">
        <div className="ai-container">
          <span>🛡️</span>

          <p>
            If you are experiencing an immediate emergency, contact local
            emergency services. LifeGuard AI is an informational support
            platform and is not a substitute for emergency responders or
            professional medical care.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AIAssistant;