import React, { useState, useEffect, useRef } from 'react';

function TodoForm({ onAdd, editingTodo, onUpdate, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      inputRef.current && inputRef.current.focus();
    } else {
      setTitle('');
      setDescription('');
      setError('');
    }
  }, [editingTodo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    const todoFields = { title: title.trim(), description: description.trim() };
    if (editingTodo) {
      onUpdate(editingTodo.id, todoFields);
    } else {
      onAdd(todoFields);
    }
    if (!editingTodo) {
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit} aria-label={editingTodo ? 'Edit To-Do' : 'Add To-Do'}>
      <input
        ref={inputRef}
        type="text"
        value={title}
        placeholder="Title"
        aria-label="To-do title"
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="text"
        value={description}
        placeholder="Description (optional)"
        aria-label="To-do description"
        onChange={e => setDescription(e.target.value)}
      />
      {error && <span role="alert" className="form-error">{error}</span>}
      <button type="submit">{editingTodo ? 'Update' : 'Add'}</button>
      {editingTodo && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}

export default TodoForm;
