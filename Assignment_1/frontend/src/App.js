import { useState, useEffect } from 'react';
const API = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');

  useEffect(() => {
    fetch(`${API}/todos`).then(r => r.json()).then(setTodos);
  }, []);

  const add = async () => {
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
  };

  return (
    <div>
      <h1>To-Do List</h1>
      <input value={task} onChange={e => setTask(e.target.value)} />
      <button onClick={add}>Add</button>
      <ul>{todos.map(t => (
        <li key={t.id}>{t.task}
          <button onClick={() => del(t.id)}>Delete</button>
        </li>
      ))}</ul>
    </div>
  );
}
export default App;