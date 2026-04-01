import { Component } from './component.js';
import {
  categoryLabels,
  deleteTodo,
  selectFilteredTodos,
  store,
  toggleTodo,
} from './store.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class TodoList extends Component {
  constructor(props = {}) {
    super(props);
    this.state = {
      todos: selectFilteredTodos(store.getState()),
    };
    this.unsubscribe = null;
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  didMount() {
    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('change', this.handleChange);
    this.unsubscribe = store.subscribe(() => {
      this.setState({ todos: selectFilteredTodos(store.getState()) });
    });
  }

  willUnmount() {
    this.el.removeEventListener('click', this.handleClick);
    this.el.removeEventListener('change', this.handleChange);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleClick(event) {
    const deleteButton = event.target.closest('[data-action="delete"]');
    if (!deleteButton) return;

    const id = deleteButton.dataset.id;
    store.dispatch(deleteTodo(id));

    if (window.location.hash === `#/todo/${id}`) {
      window.location.hash = '#/';
    }
  }

  handleChange(event) {
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (!checkbox) return;

    store.dispatch(toggleTodo(checkbox.dataset.id));
  }

  render() {
    const wrapper = document.createElement('div');
    const { todos } = this.state;

    if (!todos.length) {
      wrapper.innerHTML = `
        <div class="empty card">
          <p>Немає задач за вибраними фільтрами.</p>
        </div>
      `;
      return wrapper;
    }

    wrapper.innerHTML = `
      <ul class="todo-list">
        ${todos.map(todo => {
          const commentPreview = todo.comment
            ? `<div class="todo-preview">${escapeHtml(todo.comment)}</div>`
            : '';

          return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
              <input
                type="checkbox"
                ${todo.completed ? 'checked' : ''}
                data-action="toggle"
                data-id="${todo.id}"
                aria-label="Перемкнути статус"
              >

              <div class="todo-main">
                <a class="todo-link" href="#/todo/${todo.id}">${escapeHtml(todo.text)}</a>
                <div class="todo-meta">
                  <span class="badge badge-${todo.category}">${categoryLabels[todo.category]}</span>
                  ${commentPreview}
                </div>
              </div>

              <button class="danger-btn small-btn" data-action="delete" data-id="${todo.id}">Видалити</button>
            </li>
          `;
        }).join('')}
      </ul>
    `;

    return wrapper;
  }
}
