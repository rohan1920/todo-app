// API service for communicating with the Express backend

const API_BASE_URL = 'http://localhost:8000';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  color?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

// API functions
export const todoApi = {
  // Get all todos
  async getTodos(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return response.json();
  },

  // Create a new todo
  async createTodo(todo: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    return response.json();
  },

  // Update a todo
  async updateTodo(id: string, todo: UpdateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    return response.json();
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  },

  // Toggle todo completion
  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed });
  },
}; 