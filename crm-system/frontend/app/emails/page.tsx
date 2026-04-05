'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { emails, contacts } from '@/lib/api';
import toast from 'react-hot-toast';
import { EnvelopeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Emails() {
  const [emailsList, setEmailsList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    to_email: '', subject: '', body: '', contact_id: '', create_followup: false
  });

  useEffect(() => {
    fetchEmails();
    fetchContacts();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await emails.getAll();
      setEmailsList(response.data);
    } catch (error) {
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contacts.getAll();
      setContactsList(response.data);
    } catch (error) {
      toast.error('Failed to load contacts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await emails.send(formData);
      toast.success('Email sent and logged!');
      setShowModal(false);
      fetchEmails();
      setFormData({ to_email: '', subject: '', body: '', contact_id: '', create_followup: false });
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Email Tracking</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Track all email communications with leads</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Compose Email
        </button>
      </div>

      {/* Email List - Responsive Cards */}
      <div className="space-y-3">
        {emailsList.map((email: any) => (
          <div key={email.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{email.subject}</p>
                <p className="text-sm text-gray-500 truncate">To: {email.to_email}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{email.body.substring(0, 100)}...</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(email.sent_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {emailsList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <EnvelopeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No emails sent yet. Compose your first email!</p>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Compose Email</h2>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <select value={formData.contact_id} onChange={(e) => {
                  const contact = contactsList.find((c: any) => c.id === parseInt(e.target.value));
                  setFormData({...formData, contact_id: e.target.value, to_email: contact?.email || ''});
                }} className="w-full px-4 py-2.5 border rounded-xl">
                  <option value="">Select Contact</option>
                  {contactsList.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}
                </select>
                <input type="text" required placeholder="Subject" value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
                <textarea required placeholder="Message" rows={6} value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.create_followup}
                    onChange={(e) => setFormData({...formData, create_followup: e.target.checked})} />
                  <span className="text-sm text-gray-700">Create follow-up task</span>
                </label>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl my-4">
                <p className="text-xs text-blue-800">🤖 Automation: Emails are automatically logged. Follow-up tasks can be auto-created!</p>
              </div>
              <button type="submit" className="btn-primary w-full">Send Email</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}