"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import { todoApi, Todo } from "./api";

// Simple task interface for backward compatibility
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// Modal for creating new tasks
function CreateTaskModal({ isOpen, onClose, onAdd }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (title: string) => void 
}) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#23232b] rounded-lg shadow-lg p-6 w-11/12 max-w-md mx-auto flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2 text-center">Create Task</h2>
        <input
          className="border rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <Button 
            type="button" 
            className="flex-1" 
            onClick={handleSubmit}
          >
            Add
          </Button>
          <Button 
            type="button" 
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// Modal for confirming task deletion
function DeleteConfirmModal({ isOpen, onClose, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#23232b] rounded-lg shadow-lg p-6 w-11/12 max-w-md mx-auto flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2 text-center">Delete Task</h2>
        <p className="text-center">Do you want to delete this task?</p>
        <div className="flex gap-2 mt-2">
          <Button 
            type="button" 
            className="flex-1" 
            onClick={onConfirm}
          >
            Yes
          </Button>
          <Button 
            type="button" 
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Todo App Component
export default function TodoApp() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Load todos from backend on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const todos = await todoApi.getTodos();
      setTasks(todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed
      })));
      setError(null);
    } catch (err) {
      setError('Failed to load todos. Make sure the backend is running.');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Task operations
  const addTask = async (title: string) => {
    try {
      const newTodo = await todoApi.createTodo({ title });
      const newTask = { 
        id: newTodo.id, 
        title: newTodo.title, 
        completed: newTodo.completed 
      };
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const updatedTodo = await todoApi.toggleTodo(id, !task.completed);
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: updatedTodo.completed } : task
        ));
      }
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-[#18181b] p-4 sm:p-8">
      {/* Header */}
      <header className="w-full h-24 flex items-center justify-center px-8 bg-black font-extrabold text-3xl sm:text-5xl tracking-wide shadow mb-8" style={{ fontFamily: 'Geist, Arial Black, Arial, sans-serif' }}>
        <span role="img" aria-label="rocket" className="mr-4">🚀</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Todo App</span>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 sm:gap-8">
        {/* Controls */}
        <Button type="button" onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto mb-2">
          Create Task
        </Button>
        
        {/* Statistics */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-60 text-lg font-semibold text-blue-600 underline underline-offset-4 text-center mb-2 w-full">
          <span>Tasks: {totalTasks}</span>
          <span>Completed: {completedTasks} of {totalTasks}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-600 py-8">
            Loading todos...
          </div>
        )}

        {/* Task List */}
        <div className="flex flex-col gap-4 w-full mt-10 sm:mt-60">
          {!loading && tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8 px-2 sm:px-8 text-base sm:text-lg">
              You Don't Have Any Task Registered Yet.
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-[#23232b] rounded-lg shadow p-4 cursor-pointer hover:ring-2 hover:ring-blue-400 transition w-full"
              >
                <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                  <span className={`text-lg ${task.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>
                    {task.title}
                  </span>
                </div>
                <button
                  className="ml-0 sm:ml-4 px-3 py-1 rounded-full text-xs font-bold border border-red-400 bg-red-100 text-red-700 hover:bg-red-200 transition w-full sm:w-auto"
                  onClick={() => handleDeleteClick(task.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateTaskModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={addTask}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
