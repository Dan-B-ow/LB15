import { Component } from '../core/component.js';
import { addTodo, store } from '../core/store.js';

export class AddTodoForm extends Component {
  constructor(props = {}) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  didMount() {
    this.el.addEventListener('submit', this.handleSubmit);
  }

  willUnmount() {
    this.el.removeEventListener('submit', this.handleSubmit);
  }

  handleSubmit(event) {
    event.preventDefault();

    const form = event.target.closest('form');
    if (!form) return;

    const formData = new FormData(form);
    const text = String(formData.get('text') || '').trim();
    const category = String(formData.get('category') || 'other');
    const comment = String(formData.get('comment') || '').trim();

    if (!text) return;

    store.dispatch(addTodo({ text, category, comment }));
    form.reset();
    form.querySelector('select[name="category"]').value = 'other';
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <form class="todo-form card">
        <div class="form-row">
          <input type="text" name="text" placeholder="Що потрібно зробити?" required>
          <select name="category">
            <option value="work">Робота</option>
            <option value="study">Навчання</option>
            <option value="home">Дім</option>
            <option value="other" selected>Інше</option>
          </select>
        </div>
        <textarea name="comment" rows="3" placeholder="Коментар до задачі (необов'язково)"></textarea>
        <div class="form-actions">
          <button type="submit" class="primary-btn">Додати задачу</button>
        </div>
      </form>
    `;

    return wrapper;
  }
}
