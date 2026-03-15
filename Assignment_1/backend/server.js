const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        done BOOLEAN DEFAULT false
      )
    `);
    console.log('Database connected and table ready');
  } catch (err) {
    console.error('DB connection error:', err.message);
    process.exit(1);
  }
}

initDB();

// GET - fetch all todos
app.get('/todos', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create a new todo
app.post('/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task is required' });
    const r = await pool.query(
      'INSERT INTO todos (task) VALUES ($1) RETURNING *',
      [task]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update a todo (edit task text or mark done)
app.put('/todos/:id', async (req, res) => {
  try {
    const { task, done } = req.body;
    const r = await pool.query(
      'UPDATE todos SET task=$1, done=$2 WHERE id=$3 RETURNING *',
      [task, done, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM todos WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => console.log('Backend running'));