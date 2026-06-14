export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
      />
      <div className="todo-text">
        <span className="todo-title">{todo.title}</span>
        {todo.description && (
          <span className="todo-desc">{todo.description}</span>
        )}
      </div>
      <button className="delete-btn" onClick={() => onDelete(todo.id)}>
        ✕
      </button>
    </li>
  );
}
