import { Component } from './component.js';
import {
  categoryLabels,
  deleteTodo,
  selectTodoById,
  store,
  toggleTodo,
  updateTodo,
} from './store.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('uk-UA');
}

export class TodoDetailPage extends Component {
  constructor(props = {}) {
    super(props);
    this.todoId = props.id;
    this.state = this.getPageState();
    this.unsubscribe = null;
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getPageState() {
    const state = store.getState();
    return {
      todo: selectTodoById(state, this.todoId),
    };
  }

  didMount() {
    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('submit', this.handleSubmit);

    this.unsubscribe = store.subscribe(() => {
      this.setState(this.getPageState());
    });
  }

  willUnmount() {
    this.el.removeEventListener('click', this.handleClick);
    this.el.removeEventListener('submit', this.handleSubmit);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleClick(event) {
    const toggleButton = event.target.closest('[data-action="toggle"]');
    if (toggleButton) {
      store.dispatch(toggleTodo(this.todoId));
      return;
    }

    const deleteButton = event.target.closest('[data-action="delete"]');
    if (deleteButton) {
      const confirmed = window.confirm('Видалити цю задачу?');
      if (confirmed) {
        store.dispatch(deleteTodo(this.todoId));
        window.location.hash = '#/';
      }
    }
  }

  handleSubmit(event) {
    const form = event.target.closest('form');
    if (!form) return;

    event.preventDefault();
    const formData = new FormData(form);
    const text = String(formData.get('text') || '').trim();
    const comment = String(formData.get('comment') || '').trim();
    const category = String(formData.get('category') || 'other');

    if (!text) {
      window.alert('Назва задачі не може бути порожньою.');
      return;
    }

    store.dispatch(updateTodo(this.todoId, { text, comment, category }));
    window.alert('Задачу оновлено.');
  }

  render() {
    const wrapper = document.createElement('div');
    const { todo } = this.state;

    if (!todo) {
      wrapper.innerHTML = `
        <section class="page detail-page">
          <a href="#/" class="back-link">← Назад до списку</a>
          <div class="card empty">
            <h2>Задачу не знайдено</h2>
            <p>Можливо, її вже видалили.</p>
          </div>
        </section>
      `;
      return wrapper;
    }

    wrapper.innerHTML = `
      <section class="page detail-page">
        <a href="#/" class="back-link">← Назад до списку</a>

        <div class="card detail-card">
          <div class="detail-top">
            <div>
              <h2>${escapeHtml(todo.text)}</h2>
              <p class="subtitle">ID: ${todo.id}</p>
            </div>
            <span class="badge badge-${todo.category}">${categoryLabels[todo.category]}</span>
          </div>

          <div class="detail-info">
            <div><span>Статус:</span> <strong>${todo.completed ? 'Виконана' : 'Активна'}</strong></div>
            <div><span>Створено:</span> <strong>${formatDate(todo.createdAt)}</strong></div>
          </div>

          <div class="detail-comment-block">
            <h3>Коментар</h3>
            <p>${todo.comment ? escapeHtml(todo.comment) : 'Коментар ще не додано.'}</p>
          </div>

          <div class="detail-actions">
            <button class="secondary-btn" data-action="toggle">
              ${todo.completed ? 'Позначити активною' : 'Позначити виконаною'}
            </button>
            <button class="danger-btn" data-action="delete">Видалити</button>
          </div>
        </div>

        <form class="card edit-form">
          <h3>Редагування задачі</h3>

          <label>
            Назва
            <input type="text" name="text" value="${escapeHtml(todo.text)}" required>
          </label>

          <label>
            Категорія
            <select name="category">
              <option value="work" ${todo.category === 'work' ? 'selected' : ''}>Робота</option>
              <option value="study" ${todo.category === 'study' ? 'selected' : ''}>Навчання</option>
              <option value="home" ${todo.category === 'home' ? 'selected' : ''}>Дім</option>
              <option value="other" ${todo.category === 'other' ? 'selected' : ''}>Інше</option>
            </select>
          </label>

          <label>
            Коментар
            <textarea name="comment" rows="5" placeholder="Додайте опис або нотатку">${escapeHtml(todo.comment)}</textarea>
          </label>

          <button type="submit" class="primary-btn">Зберегти зміни</button>
        </form>
      </section>
    `;

    return wrapper;
  }
}
