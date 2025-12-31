import Message from "./Message";

export default function ChatView({ messages, loading }) {
  return (
    <div className="chat-view">
      {messages.map((m, i) => (
        <Message key={i} role={m.role} content={m.content} />
      ))}
      {loading && (
        <Message role="assistant" content="Thinking…" />
      )}
    </div>
  );
}
