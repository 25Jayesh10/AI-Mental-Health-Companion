import React, { useState } from 'react';
import { Heart, MessageCircle, Target, TrendingUp, Award, Calendar, Activity, Smile } from 'lucide-react';
import { User } from '../types';
import MoodTracker from './MoodTracker';
import AIChat from './AIChat';
import GoalTracker from './GoalTracker';
import WeeklyProgress from './WeeklyProgress';

interface PatientDashboardProps {
  user: User;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'mood', label: 'Mood Tracker', icon: Heart },
    { id: 'chat', label: 'Chat with Kai', icon: MessageCircle },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'progress', label: 'Weekly Report', icon: Activity }
  ];

  const currentStreak = 7;
  const weeklyGoal = 5;
  const todaysMood = 7;

  const quickStats = [
    {
      title: 'Current Streak',
      value: `${currentStreak} days`,
      icon: Award,
      color: 'from-green-400 to-green-600',
      description: 'Daily check-ins completed'
    },
    {
      title: 'This Week',
      value: `${weeklyGoal}/7`,
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
      description: 'Goals achieved'
    },
    {
      title: 'Today\'s Mood',
      value: todaysMood,
      icon: Smile,
      color: 'from-purple-400 to-purple-600',
      description: 'Out of 10'
    },
    {
      title: 'Wellness Score',
      value: '8.2',
      icon: Activity,
      color: 'from-orange-400 to-orange-600',
      description: 'Based on recent activity'
    }
  ];

  const recentActivities = [
    { time: '2 hours ago', activity: 'Completed breathing exercise', mood: 'positive' },
    { time: '1 day ago', activity: 'Journal entry: "Feeling grateful today"', mood: 'positive' },
    { time: '2 days ago', activity: 'Had a tough conversation with Kai', mood: 'neutral' },
    { time: '3 days ago', activity: 'Completed mindfulness goal', mood: 'positive' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-blue-100">
              You've been doing great with your wellness journey. Ready for another day of progress?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{stat.title}</div>
            <div className="text-xs text-gray-500">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.mood === 'positive' ? 'bg-green-400' :
                      activity.mood === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.activity}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('mood')}
                  className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-pink-200 transition-colors"
                >
                  <Heart className="w-6 h-6 text-pink-500 mb-2" />
                  <div className="text-sm font-medium text-pink-700">Log Mood</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('chat')}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors"
                >
                  <MessageCircle className="w-6 h-6 text-blue-500 mb-2" />
                  <div className="text-sm font-medium text-blue-700">Chat with Kai</div>
                </button>

                <button
                  onClick={() => setActiveTab('goals')}
                  className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-colors"
                >
                  <Target className="w-6 h-6 text-green-500 mb-2" />
                  <div className="text-sm font-medium text-green-700">Check Goals</div>
                </button>

                <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-colors">
                  <Activity className="w-6 h-6 text-purple-500 mb-2" />
                  <div className="text-sm font-medium text-purple-700">Breathing</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mood' && <MoodTracker user={user} />}
        {activeTab === 'chat' && <AIChat user={user} />}
        {activeTab === 'goals' && <GoalTracker user={user} />}
        {activeTab === 'progress' && <WeeklyProgress user={user} />}
      </div>
    </div>
  );
};

export default PatientDashboard;