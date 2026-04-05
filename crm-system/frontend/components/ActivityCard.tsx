'use client';

import { PhoneIcon, EnvelopeIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ActivityCardProps {
  activity: {
    subject: string;
    type: string;
    due_date?: string;
    completed?: boolean;
    created_at: string;
  };
  onComplete?: () => void;
}

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'call': return <PhoneIcon className="w-4 h-4" />;
    case 'email': return <EnvelopeIcon className="w-4 h-4" />;
    case 'meeting': return <CalendarIcon className="w-4 h-4" />;
    default: return <ClockIcon className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch(type) {
    case 'call': return 'bg-green-100 text-green-600';
    case 'email': return 'bg-blue-100 text-blue-600';
    case 'meeting': return 'bg-purple-100 text-purple-600';
    default: return 'bg-orange-100 text-orange-600';
  }
};

export default function ActivityCard({ activity, onComplete }: ActivityCardProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
      activity.completed ? 'bg-gray-50' : 'bg-white hover:shadow-md'
    } border border-gray-100`}>
      <div className="flex items-center gap-3 flex-1">
        <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
          {getTypeIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${activity.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {activity.subject}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-gray-400 capitalize">{activity.type}</p>
            {activity.due_date && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Due: {new Date(activity.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
      {!activity.completed && onComplete && (
        <button
          onClick={onComplete}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}