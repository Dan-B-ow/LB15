export class HashRouter {
  constructor(root) {
    this.root = root;
    this.routes = [];
    this.currentComponent = null;
    this.handleRouteChange = this.handleRouteChange.bind(this);
  }

  addRoute(path, factory) {
    const keys = [];
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      });

    this.routes.push({
      path,
      factory,
      keys,
      regex: new RegExp(`^${pattern}$`),
    });

    return this;
  }

  start() {
    window.addEventListener('hashchange', this.handleRouteChange);

    if (!window.location.hash) {
      window.location.hash = '#/';
      return;
    }

    this.handleRouteChange();
  }

  stop() {
    window.removeEventListener('hashchange', this.handleRouteChange);
    if (this.currentComponent) {
      this.currentComponent.unmount();
      this.currentComponent = null;
    }
  }

  handleRouteChange() {
    const path = window.location.hash.slice(1) || '/';

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (!match) continue;

      const params = {};
      route.keys.forEach((key, index) => {
        params[key] = decodeURIComponent(match[index + 1]);
      });

      if (this.currentComponent) {
        this.currentComponent.unmount();
      }

      this.currentComponent = route.factory(params);
      this.currentComponent.mount(this.root);
      return;
    }

    window.location.hash = '#/';
  }
}
