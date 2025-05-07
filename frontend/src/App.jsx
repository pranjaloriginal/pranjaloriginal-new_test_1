import React, { useEffect, useState } from 'react';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [notif, setNotif] = useState(null);

  // Fetch todos on mount
  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/todos');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTodos(data);
    } catch(e) {
      setError('Failed to fetch todos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos() }, []);

  // Add or update todo in list
  const upsertTodo = (todo) => {
    setTodos((old) => {
      const idx = old.findIndex(t => t.id === todo.id);
      if (idx > -1) {
        const copy = [...old];
        copy[idx] = todo;
        return copy;
      } else {
        return [todo, ...old];
      }
    });
  };

  // Remove todo from list
  const removeTodo = (id) => setTodos((old) => old.filter(t => t.id !== id));

  // CRUD handlers passed down
  const handleAdd = async (fields) => {
    try {
      setNotif(null);
      const res = await fetch('http://localhost:4000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Create failed.');
      const todo = await res.json();
      upsertTodo(todo);
      setNotif('Added new to-do.');
    } catch(e) {
      setNotif(e.message || 'Failed to add todo.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this to-do item?')) return;
    try {
      setNotif(null);
      const res = await fetch(`http://localhost:4000/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) throw new Error((await res.json()).error || 'Delete failed.');
      removeTodo(id);
      setNotif('Deleted.');
    } catch(e) {
      setNotif(e.message || 'Failed to delete.');
    }
  };

  const handleEdit = (todo) => setEditingTodo(todo);
  const handleCancelEdit = () => setEditingTodo(null);

  const handleUpdate = async (id, fields) => {
    try {
      setNotif(null);
      const res = await fetch(`http://localhost:4000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed.');
      const todo = await res.json();
      upsertTodo(todo);
      setEditingTodo(null);
      setNotif('Updated.');
    } catch(e) {
      setNotif(e.message || 'Failed to update.');
    }
  };

  const handleToggleCompleted = async (id, completed) => {
    try {
      setNotif(null);
      const res = await fetch(`http://localhost:4000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (!res.ok) throw new Error('Toggle completed failed.');
      const todo = await res.json();
      upsertTodo(todo);
    } catch (e) {
      setNotif('Failed to update completion.');
    }
  };

  return (
    <div className="container">
      <h1>To-Do List</h1>

      {notif && <div className="notif" aria-live="polite">{notif}</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="error" aria-live="assertive">{error}</div>}
      <TodoForm onAdd={handleAdd} editingTodo={editingTodo} onUpdate={handleUpdate} onCancel={handleCancelEdit} />
      <TodoList
        todos={todos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleCompleted={handleToggleCompleted}
      />
    </div>
  );
}

export default App;
