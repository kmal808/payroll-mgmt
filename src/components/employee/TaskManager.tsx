import React, { useState } from 'react'
import { Plus, CheckSquare, Square, Trash2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  completed: boolean
  category: 'material' | 'punch' | 'general'
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState<Task['category']>('general')

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      category,
    }

    setTasks((prev) => [...prev, task])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <div className='space-y-6'>
      <form onSubmit={addTask} className='space-y-4'>
        <div>
          <label
            htmlFor='task'
            className='block text-sm font-medium text-gray-700'>
            New Task
          </label>
          <div className='mt-1 flex rounded-md shadow-sm'>
            <div className='relative flex items-stretch flex-grow focus-within:z-10'>
              <input
                type='text'
                name='task'
                id='task'
                className='focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300'
                placeholder='Add a new task...'
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Task['category'])}
              className='-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-gray-50'>
              <option value='material'>Material</option>
              <option value='punch'>Punch List</option>
              <option value='general'>General</option>
            </select>
            <button
              type='submit'
              className='-ml-px relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700'>
              <Plus className='h-5 w-5' />
            </button>
          </div>
        </div>
      </form>

      <div className='bg-white shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200'>
          {tasks.map((task) => (
            <li key={task.id}>
              <div className='px-4 py-4 flex items-center justify-between sm:px-6'>
                <div className='flex items-center'>
                  <button
                    onClick={() => toggleTask(task.id)}
                    className='text-gray-400 hover:text-gray-500'>
                    {task.completed ? (
                      <CheckSquare className='h-5 w-5 text-green-500' />
                    ) : (
                      <Square className='h-5 w-5' />
                    )}
                  </button>
                  <span
                    className={`ml-3 ${
                      task.completed ? 'line-through text-gray-500' : ''
                    }`}>
                    {task.title}
                  </span>
                  <span className='ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'>
                    {task.category}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className='text-red-500 hover:text-red-700'>
                  <Trash2 className='h-5 w-5' />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
