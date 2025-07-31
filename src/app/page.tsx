"use client";

import React, { useState } from "react";
import Button from "./Button";

function TaskModal({ open, onClose, onAdd }) {
  const [value, setValue] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#23232b] rounded-lg shadow-lg p-6 w-11/12 max-w-md mx-auto flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2 text-center">Create Task</h2>
        <input
          className="border rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Task title"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <Button type="button" className="flex-1" onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue(""); onClose(); } }}>Add</Button>
          <Button type="button" className="flex-1 bg-gray-300 hover:bg-gray-400 text-black" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#23232b] rounded-lg shadow-lg p-6 w-11/12 max-w-md mx-auto flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2 text-center">Delete Task</h2>
        <p className="text-center">Do you want to delete this task?</p>
        <div className="flex gap-2 mt-2">
          <Button type="button" className="flex-1" onClick={onConfirm}>Yes</Button>
          <Button type="button" className="flex-1 bg-gray-300 hover:bg-gray-400 text-black" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "First task", completed: false },
    { id: 2, title: "Second task", completed: false },
    { id: 3, title: "Third task", completed: true },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  function goToCreateTask() {
    setModalOpen(true);
  }
  function addTask(title) {
    setTasks([...tasks, { id: Date.now(), title, completed: false }]);
  }
  function goToEditTask(id) {
    alert(`Navigate to Edit Task Page for task ID: ${id}`);
  }
  function toggleTask(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }
  function askDeleteTask(id) {
    setDeleteId(id);
    setConfirmOpen(true);
  }
  function confirmDeleteTask() {
    setTasks(tasks.filter(t => t.id !== deleteId));
    setConfirmOpen(false);
    setDeleteId(null);
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-[#18181b] p-4 sm:p-8">
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addTask} />
      <ConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDeleteTask} />
      <header className="w-full h-24 flex items-center justify-center px-8 bg-black font-extrabold text-3xl sm:text-5xl tracking-wide shadow mb-8" style={{ fontFamily: 'Geist, Arial Black, Arial, sans-serif' }}>
        <span role="img" aria-label="rocket" className="mr-4">🚀</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Todo App</span>
      </header>
      <main className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 sm:gap-8">
        <Button type="button" onClick={goToCreateTask} className="w-full sm:w-auto mb-2">Create Task</Button>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-60 text-lg font-semibold text-blue-600 underline underline-offset-4 text-center mb-2 w-full">
          <span>Tasks: {total}</span>
          <span>Completed: {completed} of {total}</span>
        </div>
        <div className="flex flex-col gap-4 w-full mt-10 sm:mt-60">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8 px-2 sm:px-8 text-base sm:text-lg">You Don't Have Any Task Registered Yet.</div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-[#23232b] rounded-lg shadow p-4 cursor-pointer hover:ring-2 hover:ring-blue-400 transition w-full"
                onClick={() => goToEditTask(task.id)}
              >
                <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                  <span className={`text-lg ${task.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>{task.title}</span>
                </div>
                <button
                  className="ml-0 sm:ml-4 px-3 py-1 rounded-full text-xs font-bold border border-red-400 bg-red-100 text-red-700 hover:bg-red-200 transition w-full sm:w-auto"
                  onClick={e => { e.stopPropagation(); askDeleteTask(task.id); }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
