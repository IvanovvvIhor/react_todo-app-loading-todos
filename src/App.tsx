/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

enum Filter {
  All = 'All',
  Active = 'Active',
  Completed = 'Completed',
}

enum Errors {
  Load = 'Unable to load todos',
  Title = 'Title should not be empty',
  UnableTodo = 'Unable to add a todo',
  UnableDelete = 'Unable to delete a todo',
  UnableUpdate = 'Unable to update a todo',
}

const filterOptions = [
  { id: 'all', title: Filter.All, href: '#/' },
  { id: 'active', title: Filter.Active, href: '#/active' },
  { id: 'completed', title: Filter.Completed, href: '#/completed' },
];

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState(Filter.All);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await getTodos();

        setTodos(data);
      } catch (error) {
        setErrorMessage(Errors.Load);

        setTimeout(() => setErrorMessage(''), 3000);
      }
    };

    loadTodos();
  }, []);

  const visibleTodos = useMemo(() => {
    switch (filterStatus) {
      case Filter.Active:
        return todos.filter(todo => {
          return todo.completed === false;
        });
      case Filter.Completed:
        return todos.filter(todo => {
          return todo.completed === true;
        });
      default:
        return todos;
    }
  }, [todos, filterStatus]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: todos.length > 0 && todos.every(todo => todo.completed),
            })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => {
            return (
              <div
                data-cy="Todo"
                className={classNames('todo', {
                  completed: todo.completed,
                })}
                key={todo.id}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                {/* Remove button appears only on hover */}
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {
                todos.filter(todo => {
                  return !todo.completed;
                }).length
              }{' '}
              items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              {filterOptions.map(({ id, title, href }) => (
                <a
                  key={id}
                  href={href}
                  className={classNames('filter__link', {
                    selected: filterStatus === title,
                  })}
                  data-cy={`FilterLink${title}`}
                  onClick={() => setFilterStatus(title)}
                >
                  {title}
                </a>
              ))}
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => {
            setErrorMessage('');
          }}
        />
        {/* show only one message at a time */}
        {errorMessage}
      </div>
    </div>
  );
};
