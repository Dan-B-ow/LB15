import { Component } from './core/component.js';
import { HashRouter } from './core/hash-router.js';
import { TodoListPage } from './pages/todo-list-page.js';
import { TodoDetailPage } from './pages/todo-detail-page.js';

export class App extends Component {
  constructor(props = {}) {
    super(props);
    this.router = null;
  }

  didMount() {
    const outlet = this.el.querySelector('[data-router-outlet]');

    this.router = new HashRouter(outlet)
      .addRoute('/', () => new TodoListPage())
      .addRoute('/todo/:id', params => new TodoDetailPage(params));

    this.router.start();
  }

  willUnmount() {
    if (this.router) {
      this.router.stop();
    }
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<div data-router-outlet></div>';
    return wrapper;
  }
}
