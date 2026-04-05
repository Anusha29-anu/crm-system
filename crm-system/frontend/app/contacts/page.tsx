'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { contacts, notes } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ChatBubbleLeftIcon, 
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Contacts() {
  const [contactsList, setContactsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [notesList, setNotesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', position: '', source: 'website'
  });
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await contacts.getAll();
      setContactsList(response.data);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (contactId: number) => {
    try {
      const response = await notes.get(contactId);
      setNotesList(response.data);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await contacts.create(formData);
      toast.success(`Contact created! Lead Score: ${response.data.lead_score}`);
      setShowModal(false);
      fetchContacts();
      setFormData({ name: '', email: '', phone: '', company: '', position: '', source: 'website' });
    } catch (error) {
      toast.error('Failed to create contact');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await contacts.delete(id);
        toast.success('Contact deleted');
        fetchContacts();
      } catch (error) {
        toast.error('Failed to delete contact');
      }
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await notes.create({ content: noteContent, contact_id: selectedContact?.id });
      toast.success('Note added');
      setNoteContent('');
      fetchNotes(selectedContact?.id);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { label: 'High', color: 'bg-green-100 text-green-800' };
    if (score >= 40) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Low', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredContacts = contactsList.filter((contact: any) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      {/* Header - Responsive */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contacts & Leads</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your leads with automated scoring</p>
        </div>
        <div className="flex gap-3">
          <button className="hidden sm:flex btn-secondary items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Filter - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="sm:col-span-2 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
          </select>
          <button className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats Summary - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total Contacts</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{contactsList.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">High-Value (70+)</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {contactsList.filter((c: any) => c.lead_score >= 70).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Avg. Lead Score</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            {Math.round(contactsList.reduce((acc: number, c: any) => acc + (c.lead_score || 0), 0) / (contactsList.length || 1))}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Qualified</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">
            {contactsList.filter((c: any) => c.status === 'qualified').length}
          </p>
        </div>
      </div>

      {/* Contacts Cards (Mobile) + Table (Desktop) - Responsive */}
      <div className="block lg:hidden space-y-3">
        {filteredContacts.map((contact: any) => {
          const scoreBadge = getScoreBadge(contact.lead_score);
          return (
            <div key={contact.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.position || 'No position'}</p>
                  <p className="text-sm text-gray-600 mt-1">{contact.company || 'No company'}</p>
                  <p className="text-xs text-gray-400 mt-1">{contact.email || 'No email'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${scoreBadge.color}`}>
                    {contact.lead_score || 0} - {scoreBadge.label}
                  </span>
                  <span className="capitalize px-2 py-1 rounded-full text-xs bg-gray-100">
                    {contact.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button
                  onClick={() => {
                    setSelectedContact(contact);
                    fetchNotes(contact.id);
                    setShowNoteModal(true);
                  }}
                  className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium"
                >
                  View Notes
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Lead Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.map((contact: any) => {
                const scoreBadge = getScoreBadge(contact.lead_score);
                return (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.position || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{contact.company || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{contact.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${scoreBadge.color}`}>
                        {contact.lead_score || 0} - {scoreBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-1 rounded-full text-xs bg-gray-100">
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            fetchNotes(contact.id);
                            setShowNoteModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No contacts found</p>
        </div>
      )}

      {/* Add Contact Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold">Add New Contact</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium text-sm">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1 font-medium text-sm">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1 font-medium text-sm">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1 font-medium text-sm">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Company Name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1 font-medium text-sm">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CEO, Director, Manager"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1 font-medium text-sm">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="conference">Conference</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl my-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  🤖 <span className="font-semibold">Automation:</span> Lead scored based on email, position, company. High-scoring leads (70+) get auto-tasks!
                </p>
              </div>
              
              <button type="submit" className="w-full btn-primary py-2.5">
                Create Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal - Responsive */}
      {showNoteModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Notes - {selectedContact.name}</h2>
              <button onClick={() => setShowNoteModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                className="w-full btn-primary mt-2 py-2.5"
              >
                Add Note
              </button>
            </div>
            
            <div className="border-t p-4">
              <h3 className="font-semibold mb-2">Communication History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notesList.length > 0 ? (
                  notesList.map((note: any) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-600">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}