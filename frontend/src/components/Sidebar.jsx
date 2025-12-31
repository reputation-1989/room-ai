export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">room.ai</span>
        <button onClick={onNew}>＋</button>
      </div>

      <div className="conversation-list">
        {conversations.map(c => (
          <div
            key={c.id}
            className={`conversation ${
              c.id === activeId ? "active" : ""
            }`}
            onClick={() => onSelect(c.id)}
          >
            {c.title}
          </div>
        ))}
      </div>
    </aside>
  );
}
