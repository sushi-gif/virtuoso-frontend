import React, { useState } from "react";
import { useApi } from "../utils/Hooks";
import { RiSendPlaneFill } from "react-icons/ri";
import { BsSendArrowUpFill } from "react-icons/bs";
import { RiDeleteBin6Fill } from "react-icons/ri";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export function Claude() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { apiCall } = useApi(); // Using the useApi hook

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add the user's message
    const userMessage: ChatMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Make the API call using the useApi hook
      const response = await apiCall<{ text: string }>(
        "POST",
        "/claude/chat",
        {},
        { text: inputValue }
      );

      // Add the bot's response
      const botMessage: ChatMessage = { sender: "bot", text: response!.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="notification">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {message.sender === "bot" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: message.text.replace(/\n/g, "<br>"),
                  }}
                />
              ) : (
                message.text
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="message loading-message bot-message">Bot is typing...</div>
        )}
      </div>
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="input"
          disabled={loading}
        />
        <button
          className="button clear-chat-btn"
          onClick={() => setMessages([])}
        >
          <RiDeleteBin6Fill size={22} />
        </button>
        <button
          onClick={sendMessage}
          className="button claude-btn"
          disabled={loading}
        >
          {loading ? <BsSendArrowUpFill size={20} /> : <RiSendPlaneFill size={24} />}
        </button>
      </div>
    </div>
  );
}
