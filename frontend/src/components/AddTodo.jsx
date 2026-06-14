import { useState } from "react";

export default function AddTodo({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), description: description.trim() });
    setTitle("");
    setDescription("");
  }

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Titel *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Beschreibung (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Hinzufügen</button>
    </form>
  );
}
