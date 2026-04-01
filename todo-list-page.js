import { Component } from './component.js';
import { AddTodoForm } from './add-todo-form.js';
import { TodoList } from './todo-list.js';
import {
  clearAllTodos,
  Filters,
  selectActiveCount,
  selectCategoryFilter,
  selectCompletedCount,
  selectFilter,
  selectTodoCount,
  setCategoryFilter,
  setFilter,
  store,
} from './store.js';

export class TodoListPage extends Component {
  constructor(props = {}) {
    super(props);
    this.state = this.getPageState();
    this.unsubscribe = null;
    this.addTodoForm = null;
    this.todoList = null;
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getPageState() {
    const state = store.getState();
    return {
      filter: selectFilter(state),
      categoryFilter: selectCategoryFilter(state),
      total: selectTodoCount(state),
      active: selectActiveCount(state),
      completed: selectCompletedCount(state),
    };
  }

  didMount() {
    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('change', this.handleChange);

    this.unsubscribe = store.subscribe(() => {
      this.setState(this.getPageState());
    });

    this.mountChildren();
  }

  beforeUpdate() {
    this.unmountChildren();
  }

  didRender() {
    this.mountChildren();
  }

  willUnmount() {
    this.el.removeEventListener('click', this.handleClick);
    this.el.removeEventListener('change', this.handleChange);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.unmountChildren();
  }

  mountChildren() {
    const formRoot = this.el.querySelector('[data-slot="form"]');
    const listRoot = this.el.querySelector('[data-slot="list"]');

    if (formRoot) {
      this.addTodoForm = new AddTodoForm();
      this.addTodoForm.mount(formRoot);
    }

    if (listRoot) {
      this.todoList = new TodoList();
      this.todoList.mount(listRoot);
    }
  }

  unmountChildren() {
    if (this.addTodoForm) {
      this.addTodoForm.unmount();
      this.addTodoForm = null;
    }

    if (this.todoList) {
      this.todoList.unmount();
      this.todoList = null;
    }
  }

  handleClick(event) {
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      store.dispatch(setFilter(filterButton.dataset.filter));
      return;
    }

    const clearButton = event.target.closest('[data-action="clear-all"]');
    if (clearButton) {
      const state = store.getState();
      if (!state.todos.length) return;

      const confirmed = window.confirm('Видалити всі задачі?');
      if (confirmed) {
        store.dispatch(clearAllTodos());
      }
    }
  }

  handleChange(event) {
    const categorySelect = event.target.closest('[name="category-filter"]');
    if (!categorySelect) return;
    store.dispatch(setCategoryFilter(categorySelect.value));
  }

  render() {
    const { filter, categoryFilter, total, active, completed } = this.state;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <section class="page">
        <header class="page-header">
          <div>
            <h1>Трохи кращий (більший) TO-DO list</h1>
            <p class="subtitle">Треба спати...</p>
          </div>
        </header>

        <div data-slot="form"></div>

        <section class="card controls-card">
          <div class="filters">
            <button class="filter-btn ${filter === Filters.ALL ? 'active' : ''}" data-filter="${Filters.ALL}">Всі</button>
            <button class="filter-btn ${filter === Filters.ACTIVE ? 'active' : ''}" data-filter="${Filters.ACTIVE}">Активні</button>
            <button class="filter-btn ${filter === Filters.COMPLETED ? 'active' : ''}" data-filter="${Filters.COMPLETED}">Виконані</button>
          </div>

          <div class="controls-row">
            <select name="category-filter">
              <option value="all" ${categoryFilter === 'all' ? 'selected' : ''}>Всі категорії</option>
              <option value="work" ${categoryFilter === 'work' ? 'selected' : ''}>Робота</option>
              <option value="study" ${categoryFilter === 'study' ? 'selected' : ''}>Навчання</option>
              <option value="home" ${categoryFilter === 'home' ? 'selected' : ''}>Дім</option>
              <option value="other" ${categoryFilter === 'other' ? 'selected' : ''}>Інше</option>
            </select>

            <button class="secondary-btn" data-action="clear-all">Очистити все</button>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Всього</span>
              <strong>${total}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">Активні</span>
              <strong>${active}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">Виконані</span>
              <strong>${completed}</strong>
            </div>
          </div>
        </section>

        <div data-slot="list"></div>
      </section>
    `;

    return wrapper;
  }
}
