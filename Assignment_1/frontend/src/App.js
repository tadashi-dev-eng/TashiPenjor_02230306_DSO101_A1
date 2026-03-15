import { useState, useEffect } from 'react';
import './App.css';

const API = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState('');

  useEffect(() => {
    fetch(`${API}/todos`)
      .then(r => r.json())
      .then(setTodos);
  }, []);

  const add = async () => {
    if (!task.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task })
    });
    setTodos([...todos, await res.json()]);
    setTask('');
  };

  const del = async (id) => {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.id !== id));
    if (editingId === id) cancelEdit();
  };

  const toggleDone = async (todo) => {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: todo.task, done: !todo.done })
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === todo.id ? updated : t)));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingTask(todo.task);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTask('');
  };

  const saveEdit = async () => {
    if (!editingTask.trim()) return;
    const res = await fetch(`${API}/todos/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: editingTask, done: todos.find(t => t.id === editingId)?.done })
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === editingId ? updated : t)));
    cancelEdit();
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>To‑Do List</h1>
      </header>

      <section className="card">
        <div className="form-row">
          <input
            className="input"
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="Add a new task"
          />
          <button className="primary" onClick={add}>Add</button>
        </div>

        <ul className="todo-list">
          {todos.map(t => (
            <li key={t.id} className={`todo-item ${t.done ? 'done' : ''}`}>
              <div className="todo-main">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(t)}
                />
                {editingId === t.id ? (
                  <input
                    className="edit-input"
                    value={editingTask}
                    onChange={e => setEditingTask(e.target.value)}
                  />
                ) : (
                  <span className="task-text">{t.task}</span>
                )}
              </div>

              <div className="actions">
                {editingId === t.id ? (
                  <>
                    <button className="secondary" onClick={saveEdit}>Save</button>
                    <button className="secondary" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="secondary" onClick={() => startEdit(t)}>Edit</button>
                    <button className="danger" onClick={() => del(t.id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;