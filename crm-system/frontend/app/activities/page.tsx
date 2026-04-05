'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { activities } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ClockIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Activities() {
  const [activitiesList, setActivitiesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'task', subject: '', description: '', due_date: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activities.getAll();
      setActivitiesList(response.data);
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await activities.complete(id);
      toast.success('Task completed!');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await activities.create(formData);
      toast.success('Activity created!');
      setShowModal(false);
      fetchActivities();
      setFormData({ type: 'task', subject: '', description: '', due_date: '' });
    } catch (error) {
      toast.error('Failed to create activity');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const pendingTasks = activitiesList.filter((a: any) => !a.completed);
  const completedTasks = activitiesList.filter((a: any) => a.completed);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Activities</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your daily tasks and activities</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          New Activity
        </button>
      </div>

      {/* Stats - Responsive */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-yellow-800">Pending Tasks</p>
          <p className="text-2xl font-bold text-yellow-900">{pendingTasks.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-800">Completed Tasks</p>
          <p className="text-2xl font-bold text-green-900">{completedTasks.length}</p>
        </div>
      </div>

      {/* Activities List - Responsive */}
      <div className="space-y-3">
        {activitiesList.map((activity: any) => (
          <div key={activity.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'call' ? 'bg-green-100' :
                  activity.type === 'email' ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  {activity.type === 'call' ? '📞' : activity.type === 'email' ? '📧' : '✅'}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${activity.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {activity.subject}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {activity.type} • Due: {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
              </div>
              {!activity.completed && (
                <button
                  onClick={() => handleComplete(activity.id)}
                  className="flex items-center justify-center gap-1 px-4 py-2 text-green-600 bg-green-50 rounded-lg text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
        {activitiesList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No activities yet. Create your first task!</p>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Activity</h2>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl">
                  <option value="task">Task</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
                <input type="text" required placeholder="Subject" value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
                <textarea placeholder="Description" rows={3} value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
                <input type="datetime-local" value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
              </div>
              <button type="submit" className="btn-primary w-full mt-6">Create Activity</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}