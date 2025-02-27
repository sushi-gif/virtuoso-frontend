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

  const { apiCall } = useApi();

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await apiCall<{ text: string }>(
        "POST",
        "/claude/chat",
        {},
        { text: inputValue }
      );

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

  const formatMessage = (text: string) => {
    const tableMatch = text.match(/\[Tool .*? result: \[TextContent\(type='text', text='(.*?)'\)\]\]/);
    if (tableMatch) {
      const tableContent = tableMatch[1];
      const rows = tableContent.split(/\\n/).map(row => row.split(" | "));
      return (
        <>
          <div>{text.replace(tableMatch[0], "").trim()}</div>
          <table className="formatted-table">
            <tbody>
              {rows.map((cols, rowIndex) => (
                <tr key={rowIndex}>
                  {cols.map((col, colIndex) => (
                    <td key={colIndex}>{col.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, "<br>") }} />;
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="notification">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
            >
              {message.sender === "bot" ? formatMessage(message.text) : message.text}
            </div>
          ))
        )}
        {loading && <div className="message loading-message bot-message">Bot is typing...</div>}
      </div>
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="input"
          disabled={loading}
        />
        <button className="button clear-chat-btn" onClick={() => setMessages([])}>
          <RiDeleteBin6Fill size={22} />
        </button>
        <button onClick={sendMessage} className="button claude-btn" disabled={loading}>
          {loading ? <BsSendArrowUpFill size={20} /> : <RiSendPlaneFill size={24} />}
        </button>
      </div>
    </div>
  );
}
