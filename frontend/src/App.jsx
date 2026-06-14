import { useEffect, useState } from "react";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";

const API = "/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Fehler beim Laden");
      setTodos(await res.json());
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAdd(data) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setTodos([await res.json(), ...todos]);
  }

  async function handleToggle(id, completed) {
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (res.ok) setTodos(todos.filter((t) => t.id !== id));
  }

  const filtered = todos.filter((t) => {
    if (filter === "open") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const openCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <header>
        <h1>To-Do Dashboard</h1>
        <span className="badge">{openCount} offen</span>
      </header>

      {error && <p className="error">{error}</p>}

      <AddTodo onAdd={handleAdd} />

      <div className="filter-bar">
        {["all", "open", "done"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Alle" : f === "open" ? "Offen" : "Erledigt"}
          </button>
        ))}
      </div>

      <TodoList
        todos={filtered}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
}
