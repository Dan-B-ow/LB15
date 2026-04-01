export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.root = null;
    this.el = null;
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.update();
  }

  render() {
    return document.createElement('div');
  }

  mount(root) {
    this.root = root;

    if (!this.el) {
      this.el = document.createElement('div');
    }

    this.root.innerHTML = '';
    this.root.appendChild(this.el);
    this.update();

    if (typeof this.didMount === 'function') {
      this.didMount();
    }

    return this;
  }

  update() {
    if (!this.el) return;

    if (typeof this.beforeUpdate === 'function') {
      this.beforeUpdate();
    }

    const content = this.render();
    this.el.innerHTML = '';

    if (content) {
      this.el.appendChild(content);
    }

    if (typeof this.didRender === 'function') {
      this.didRender();
    }
  }

  unmount() {
    if (typeof this.willUnmount === 'function') {
      this.willUnmount();
    }

    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }

    this.root = null;
    this.el = null;
  }
}
