'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { dashboard } from '@/lib/api';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
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
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const cards = [
    { title: 'Total Leads', value: stats?.total_leads || 0, icon: UsersIcon, color: 'bg-blue-500', change: '+12%' },
    { title: 'Active Deals', value: stats?.total_deals || 0, icon: RocketLaunchIcon, color: 'bg-green-500', change: '+8%' },
    { title: 'Won Deals', value: stats?.won_deals || 0, icon: TrophyIcon, color: 'bg-yellow-500', change: '+5%' },
    { title: 'Pipeline Value', value: `$${(stats?.pipeline_value || 0).toLocaleString()}`, icon: CurrencyDollarIcon, color: 'bg-purple-500', change: '+23%' },
    { title: 'Conversion Rate', value: `${stats?.conversion_rate || 0}%`, icon: ChartBarIcon, color: 'bg-indigo-500', change: '+3%' },
    { title: 'Pending Tasks', value: stats?.pending_tasks || 0, icon: ClockIcon, color: 'bg-orange-500', change: '-2' },
  ];

  const leadQualityData = [
    { name: 'High (70+)', value: stats?.high_score_leads || 0, color: '#10B981' },
    { name: 'Medium (40-69)', value: stats?.mid_score_leads || 0, color: '#F59E0B' },
    { name: 'Low (<40)', value: stats?.low_score_leads || 0, color: '#EF4444' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Welcome back! Here's your business overview</p>
      </div>

      {/* Time Range Selector - Scrollable on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['Today', 'Week', 'Month', 'Year'].map((range) => (
          <button
            key={range}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 whitespace-nowrap"
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{card.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                <p className="text-xs text-green-600 mt-1">{card.change}</p>
              </div>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Pipeline by Stage</h2>
            <select className="text-sm border rounded-lg px-3 py-1.5 bg-white">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.pipeline || []}>
                <XAxis dataKey="stage" stroke="#9CA3AF" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Quality Distribution */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Lead Quality Distribution</h2>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadQualityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadQualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Activities</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
        </div>
        {stats?.recent_activities?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_activities.slice(0, 5).map((activity: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'call' ? 'bg-green-500' :
                  activity.type === 'email' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.subject}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </div>
    </Layout>
  );
}