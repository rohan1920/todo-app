"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import { todoApi, Todo } from "./api";

// Simple task interface for backward compatibility
interface Task {
  id: string;
  title: string;
  completed: boolean;
  color?: string;
}

// Modal for creating new tasks
function CreateTaskModal({ isOpen, onClose, onAdd }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (title: string, color: string) => void 
}) {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("orange");
  const [savedColor, setSavedColor] = useState<string | null>(null);

  const colors = [
    { name: "red", hex: "#ef4444" },
    { name: "orange", hex: "#f97316" },
    { name: "yellow", hex: "#eab308" },
    { name: "green", hex: "#22c55e" },
    { name: "lightBlue", hex: "#06b6d4" },
    { name: "darkBlue", hex: "#3b82f6" },
    { name: "purple", hex: "#8b5cf6" },
    { name: "pink", hex: "#ec4899" },
    { name: "brown", hex: "#a16207" }
  ];

  const handleSaveColor = () => {
    setSavedColor(selectedColor);
  };

  const handleSubmit = () => {
    if (title.trim() && savedColor) {
      onAdd(title.trim(), savedColor);
      setTitle("");
      setSelectedColor("orange");
      setSavedColor(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#18181b] rounded-lg shadow-lg p-6 w-11/12 max-w-md mx-auto flex flex-col gap-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-white">Add New Task</h2>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-cyan-400 text-sm font-medium">Title</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Ex. Brush your teeth"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-cyan-400 text-sm font-medium">Color</label>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === color.name 
                    ? 'border-purple-500 shadow-lg scale-110' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.name && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Save Color Button */}
          <button
            onClick={handleSaveColor}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-3"
          >
            Save Color
          </button>
          
          {/* Saved Color Status */}
          {savedColor && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors.find(c => c.name === savedColor)?.hex }}
              ></div>
              <span className="text-green-400 text-sm">Color saved: {savedColor}</span>
            </div>
          )}
        </div>

        {/* Add Task Button */}
        <button
          onClick={handleSubmit}
          disabled={!savedColor}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            savedColor 
              ? 'bg-teal-600 hover:bg-teal-700 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Add Task
          <span className="text-white">?</span>
        </button>
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
        completed: todo.completed,
        color: todo.color || 'orange'
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
  const addTask = async (title: string, color: string = "orange") => {
    try {
      const newTodo = await todoApi.createTodo({ title, color });
      const newTask = { 
        id: newTodo.id, 
        title: newTodo.title, 
        completed: newTodo.completed,
        color: newTodo.color
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
        <button 
          type="button" 
          onClick={() => setShowCreateModal(true)} 
          className="w-full sm:w-auto mb-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Create Task
        </button>
        
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
            tasks.map(task => {
              const colorMap = {
                red: "#ef4444",
                orange: "#f97316", 
                yellow: "#eab308",
                green: "#22c55e",
                lightBlue: "#06b6d4",
                darkBlue: "#3b82f6",
                purple: "#8b5cf6",
                pink: "#ec4899",
                brown: "#a16207"
              };
              
              const taskColor = colorMap[task.color as keyof typeof colorMap] || "#f97316";
              
              return (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-600 transition w-full"
                >
                  <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-600"
                      style={{ backgroundColor: taskColor }}
                    ></div>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 accent-teal-600 cursor-pointer"
                    />
                    <span className={`text-lg ${task.completed ? "line-through text-gray-500" : "text-gray-100"}`}>
                      {task.title}
                    </span>
                  </div>
                  <button
                    className="ml-0 sm:ml-4 px-3 py-1 rounded-full text-xs font-bold border border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition w-full sm:w-auto"
                    onClick={() => handleDeleteClick(task.id)}
                  >
                    Delete
                  </button>
                </div>
              );
            })
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
