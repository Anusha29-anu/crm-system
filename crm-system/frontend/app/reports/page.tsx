'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { dashboard } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboard.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const leadQualityData = [
    { name: 'High (70+)', value: stats?.high_score_leads || 0, color: '#10B981' },
    { name: 'Medium (40-69)', value: stats?.mid_score_leads || 0, color: '#F59E0B' },
    { name: 'Low (<40)', value: stats?.low_score_leads || 0, color: '#EF4444' },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Comprehensive business insights</p>
      </div>

      {/* Key Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats?.conversion_rate || 0}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">Pipeline Value</p>
          <p className="text-2xl font-bold text-blue-600">${(stats?.pipeline_value || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">Won Deals</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.won_deals || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">High-Value Leads</p>
          <p className="text-2xl font-bold text-orange-600">{stats?.high_score_leads || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <h2 className="text-lg font-semibold mb-4">Pipeline Value by Stage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.pipeline || []}>
                <XAxis dataKey="stage" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <h2 className="text-lg font-semibold mb-4">Lead Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadQualityData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80} dataKey="value">
                  {leadQualityData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-800 font-medium">Top Performing Stage</p>
          <p className="text-lg font-bold text-green-900 mt-1">
            {stats?.pipeline?.reduce((a: any, b: any) => (a.count > b.count ? a : b), { stage: 'N/A' }).stage}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-800 font-medium">Highest Value Stage</p>
          <p className="text-lg font-bold text-blue-900 mt-1">
            {stats?.pipeline?.reduce((a: any, b: any) => (a.value > b.value ? a : b), { stage: 'N/A' }).stage}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-800 font-medium">Lead Quality</p>
          <p className="text-lg font-bold text-purple-900 mt-1">{stats?.high_score_leads || 0} High-Value</p>
        </div>
      </div>
    </Layout>
  );
}