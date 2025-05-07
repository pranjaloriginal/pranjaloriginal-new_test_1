import React from 'react';

function TodoList({ todos, onEdit, onDelete, onToggleCompleted }) {
  if (!todos.length) return <div>No to-dos yet.</div>;
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          <input
            type="checkbox"
            checked={todo.completed}
            aria-label={`Mark '${todo.title}' as completed`}
            onChange={() => onToggleCompleted(todo.id, !todo.completed)}
          />
          <div className="todo-content">
            <strong>{todo.title}</strong>
            {todo.description && <div className="desc">{todo.description}</div>}
          </div>
          <div className="actions">
            <button onClick={() => onEdit(todo)} aria-label="Edit to-do">✏️</button>
            <button onClick={() => onDelete(todo.id)} aria-label="Delete to-do">🗑️</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
