import { useState, useEffect } from 'react';
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
      body: JSON.stringify({ task: editingTask })
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === editingId ? updated : t)));
    cancelEdit();
  };

  return (
    <div>
      <h1>To-Do List</h1>

      <div>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="New task"
        />
        <button onClick={add}>Add</button>
      </div>

      <ul>
        {todos.map(t => (
          <li key={t.id}>
            {editingId === t.id ? (
              <>
                <input
                  value={editingTask}
                  onChange={e => setEditingTask(e.target.value)}
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span>{t.task}</span>
                <button onClick={() => startEdit(t)}>Edit</button>
                <button onClick={() => del(t.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;