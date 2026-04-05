'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { deals, contacts } from '@/lib/api';
import toast from 'react-hot-toast';
import { PlusIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/outline';

const stages = ['lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const stageLabels: Record<string, string> = {
  lead: 'Lead', contacted: 'Contacted', qualified: 'Qualified',
  proposal: 'Proposal', negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost'
};

export default function Deals() {
  const [dealsList, setDealsList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', amount: '', expected_close_date: '', contact_id: ''
  });

  useEffect(() => {
    fetchDeals();
    fetchContacts();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await deals.getAll();
      setDealsList(response.data);
    } catch (error) {
      toast.error('Failed to load deals');
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

  const handleStageChange = async (dealId: number, newStage: string) => {
    try {
      const response = await deals.updateStage(dealId, newStage);
      toast.success(`Deal moved to ${stageLabels[newStage]}`);
      fetchDeals();
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deals.create(formData);
      toast.success('Deal created!');
      setShowModal(false);
      fetchDeals();
      setFormData({ title: '', amount: '', expected_close_date: '', contact_id: '' });
    } catch (error) {
      toast.error('Failed to create deal');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Deals Pipeline</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Track and manage your sales opportunities</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          New Deal
        </button>
      </div>

      {/* Mobile: Horizontal Scroll Pipeline */}
      <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div key={stage} className="w-72 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">{stageLabels[stage]}</h3>
                  <span className="text-sm text-gray-500">
                    {dealsList.filter((d: any) => d.stage === stage).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {dealsList.filter((d: any) => d.stage === stage).map((deal: any) => (
                    <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <h4 className="font-medium text-gray-800 text-sm">{deal.title}</h4>
                      <p className="text-green-600 font-bold text-sm">${deal.amount.toLocaleString()}</p>
                      <select
                        value={deal.stage}
                        onChange={(e) => handleStageChange(deal.id, e.target.value)}
                        className="mt-2 text-xs border rounded-lg px-2 py-1 w-full"
                      >
                        {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Pipeline */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-4">
        {stages.map((stage) => (
          <div key={stage} className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">{stageLabels[stage]}</h3>
              <span className="text-sm text-gray-500">
                {dealsList.filter((d: any) => d.stage === stage).length}
              </span>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              {dealsList.filter((d: any) => d.stage === stage).map((deal: any) => (
                <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition">
                  <h4 className="font-medium text-gray-800">{deal.title}</h4>
                  <p className="text-green-600 font-bold">${deal.amount.toLocaleString()}</p>
                  <select
                    value={deal.stage}
                    onChange={(e) => handleStageChange(deal.id, e.target.value)}
                    className="mt-2 text-xs border rounded-lg px-2 py-1 w-full"
                  >
                    {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Deal</h2>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <input type="text" required placeholder="Deal Title" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
                <input type="number" placeholder="Amount" value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
                <select value={formData.contact_id}
                  onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl">
                  <option value="">Select Contact</option>
                  {contactsList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="date" value={formData.expected_close_date}
                  onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl" />
              </div>
              <button type="submit" className="btn-primary w-full mt-6">Create Deal</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}