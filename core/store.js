const STORAGE_KEY = 'todo_store_spa_v2';

export const Filters = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
};

const categories = ['work', 'study', 'home', 'other'];

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneState(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeTodo(todo) {
  return {
    id: todo.id || createId(),
    text: String(todo.text || '').trim(),
    comment: String(todo.comment || '').trim(),
    completed: Boolean(todo.completed),
    createdAt: todo.createdAt || Date.now(),
    category: categories.includes(todo.category) ? todo.category : 'other',
  };
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeTodo).filter(todo => todo.text);
  } catch (error) {
    console.error('Не вдалося прочитати LocalStorage:', error);
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Не вдалося зберегти LocalStorage:', error);
  }
}

export class Store {
  constructor(reducer, initialState = {}) {
    this.reducer = reducer;
    this.state = cloneState(initialState);
    this.listeners = [];
  }

  getState() {
    return cloneState(this.state);
  }

  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener());
    return action;
  }

  subscribe(listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(item => item !== listener);
    };
  }
}

export const ActionTypes = {
  ADD_TODO: 'ADD_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  DELETE_TODO: 'DELETE_TODO',
  SET_FILTER: 'SET_FILTER',
  SET_CATEGORY_FILTER: 'SET_CATEGORY_FILTER',
  UPDATE_TODO: 'UPDATE_TODO',
  CLEAR_ALL: 'CLEAR_ALL',
};

export const addTodo = ({ text, category = 'other', comment = '' }) => ({
  type: ActionTypes.ADD_TODO,
  payload: normalizeTodo({
    id: createId(),
    text,
    comment,
    category,
    completed: false,
    createdAt: Date.now(),
  }),
});

export const toggleTodo = id => ({
  type: ActionTypes.TOGGLE_TODO,
  payload: { id },
});

export const deleteTodo = id => ({
  type: ActionTypes.DELETE_TODO,
  payload: { id },
});

export const setFilter = filter => ({
  type: ActionTypes.SET_FILTER,
  payload: { filter },
});

export const setCategoryFilter = category => ({
  type: ActionTypes.SET_CATEGORY_FILTER,
  payload: { category },
});

export const updateTodo = (id, changes) => ({
  type: ActionTypes.UPDATE_TODO,
  payload: { id, changes },
});

export const clearAllTodos = () => ({
  type: ActionTypes.CLEAR_ALL,
});

export const initialState = {
  todos: loadTodos(),
  filter: Filters.ALL,
  categoryFilter: 'all',
};

export function todoReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ActionTypes.ADD_TODO: {
      if (!action.payload.text) return state;
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    }

    case ActionTypes.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case ActionTypes.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id),
      };

    case ActionTypes.SET_FILTER:
      return {
        ...state,
        filter: Object.values(Filters).includes(action.payload.filter)
          ? action.payload.filter
          : Filters.ALL,
      };

    case ActionTypes.SET_CATEGORY_FILTER:
      return {
        ...state,
        categoryFilter: action.payload.category || 'all',
      };

    case ActionTypes.UPDATE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo => {
          if (todo.id !== action.payload.id) return todo;

          return normalizeTodo({
            ...todo,
            ...action.payload.changes,
            id: todo.id,
            createdAt: todo.createdAt,
          });
        }),
      };

    case ActionTypes.CLEAR_ALL:
      return {
        ...state,
        todos: [],
      };

    default:
      return state;
  }
}

export const selectTodos = state => state.todos;
export const selectTodoById = (state, id) => state.todos.find(todo => todo.id === id) || null;
export const selectFilter = state => state.filter;
export const selectCategoryFilter = state => state.categoryFilter;
export const selectTodoCount = state => state.todos.length;
export const selectActiveCount = state => state.todos.filter(todo => !todo.completed).length;
export const selectCompletedCount = state => state.todos.filter(todo => todo.completed).length;

export const selectFilteredTodos = state => {
  const todos = selectTodos(state);
  const filter = selectFilter(state);
  const categoryFilter = selectCategoryFilter(state);

  return todos.filter(todo => {
    const matchesStatus =
      filter === Filters.ALL ||
      (filter === Filters.ACTIVE && !todo.completed) ||
      (filter === Filters.COMPLETED && todo.completed);

    const matchesCategory =
      categoryFilter === 'all' || todo.category === categoryFilter;

    return matchesStatus && matchesCategory;
  });
};

export const categoryLabels = {
  work: 'Робота',
  study: 'Навчання',
  home: 'Дім',
  other: 'Інше',
};

export const store = new Store(todoReducer, initialState);

store.subscribe(() => {
  saveTodos(selectTodos(store.getState()));
});
