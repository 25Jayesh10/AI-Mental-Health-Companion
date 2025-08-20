import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Target, TrendingUp, Award, Calendar, Activity, Smile, BookOpen, X, Users } from 'lucide-react';
import { User } from '../types';
import MoodTracker from './MoodTracker';
import AIChat from './AIChat';
import GoalTracker from './GoalTracker';
import WeeklyProgress from './WeeklyProgress';
import Journaling from './Journaling';

interface PatientDashboardProps {
    user: User;
}

// 💥 Updated interface with the new flag from the backend
interface DashboardData {
    mood_entries: { created_at: string; mood: number; notes: string }[];
    journal_entries: { created_at: string; title: string; content: string }[];
    goals: { id: string; is_completed: boolean }[];
    currentStreak?: number;
    todaysMood?: number;
    weeklyGoals?: number;
    wellnessScore?: number;
    needs_counselor?: boolean;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 💥 New state for the consent modal
    const [showConsentModal, setShowConsentModal] = useState(false);
    // 💥 New state for data access permission
    const [giveDataAccess, setGiveDataAccess] = useState(true);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'mood', label: 'Mood Tracker', icon: Heart },
        { id: 'journal', label: 'Journal', icon: BookOpen },
        { id: 'chat', label: 'Chat with Kai', icon: MessageCircle },
        { id: 'goals', label: 'My Goals', icon: Target },
        { id: 'progress', label: 'Weekly Report', icon: Activity }
    ];

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data.');
            }
            const data = await response.json();
            setDashboardData(data);
            // 💥 Check the flag from the backend and show the modal if needed
            if (data.needs_counselor) { 
                setShowConsentModal(true);
            }
        } catch (err) {
            console.error("API call failed:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchDashboardData();
        }
    }, [user.id]);

    // 💥 New function to handle the patient's consent
    const handleConsent = async (consent: boolean) => {
        setShowConsentModal(false);
        if (consent) {
            try {
                const response = await fetch('http://localhost/ai_companion_backend/api/patient_consent.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        consent: true,
                        data_access: giveDataAccess
                    }),
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Assignment failed.');
                }
                console.log(result.message);
                // Re-fetch dashboard data to update the UI
                fetchDashboardData();
            } catch (err: any) {
                console.error('Consent submission failed:', err);
                setError(err.message || "Failed to submit consent.");
            }
        } else {
            // Reset the flag on the backend if consent is denied
            try {
                await fetch('http://localhost/ai_companion_backend/api/patient_consent.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        consent: false
                    }),
                });
            } catch (err) {
                console.error("Error clearing needs_counselor flag:", err);
            }
        }
    };

    const getMoodEmoji = (mood: number) => {
        if (mood >= 8) return '😄';
        if (mood >= 6) return '🙂';
        if (mood >= 4) return '😐';
        return '😞';
    };
    const getMoodColor = (mood: number) => {
        if (mood >= 8) return 'bg-green-400';
        if (mood >= 6) return 'bg-lime-400';
        if (mood >= 4) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    if (isLoading) {
        return <div className="text-center py-10 text-gray-500">Loading your dashboard...</div>;
    }
    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    const allActivities = [
        ...(dashboardData?.mood_entries.map(entry => ({
            time: new Date(entry.created_at).toLocaleDateString(),
            activity: `Mood entry: ${getMoodEmoji(entry.mood)} (${entry.mood}/10)`,
            mood: entry.mood >= 6 ? 'positive' : entry.mood <= 4 ? 'negative' : 'neutral'
        })) || []),
        ...(dashboardData?.journal_entries.map(entry => ({
            time: new Date(entry.created_at).toLocaleDateString(),
            activity: `Journal entry: "${entry.content.substring(0, 30)}..."`,
            mood: 'neutral'
        })) || [])
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const quickStats = [
        {
            title: 'Current Streak',
            value: `${dashboardData?.currentStreak || 0} days`,
            icon: Award,
            color: 'from-green-400 to-green-600',
            description: 'Daily check-ins completed'
        },
        {
            title: 'Weekly Goals',
            value: `${dashboardData?.weeklyGoals || 0}/7`,
            icon: Calendar,
            color: 'from-blue-400 to-blue-600',
            description: 'Completed in the last 7 days'
        },
        {
            title: 'Today\'s Mood',
            value: `${dashboardData?.todaysMood || '- '}`,
            icon: Smile,
            color: 'from-purple-400 to-purple-600',
            description: 'Out of 10'
        },
        {
            title: 'Wellness Score',
            value: `${dashboardData?.wellnessScore || '- '}`,
            icon: Activity,
            color: 'from-orange-400 to-orange-600',
            description: 'Based on recent activity'
        }
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
                                {allActivities.slice(0, 4).map((activity, index) => (
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
                                    onClick={() => setActiveTab('journal')}
                                    className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-colors"
                                >
                                    <BookOpen className="w-6 h-6 text-yellow-500 mb-2" />
                                    <div className="text-sm font-medium text-yellow-700">New Entry</div>
                                </button>
                                
                                <button
                                    onClick={() => setActiveTab('goals')}
                                    className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-colors"
                                >
                                    <Target className="w-6 h-6 text-green-500 mb-2" />
                                    <div className="text-sm font-medium text-green-700">Check Goals</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'journal' && <Journaling user={user} />}
                {activeTab === 'mood' && <MoodTracker user={user} />}
                {activeTab === 'chat' && <AIChat user={user} />}
                {activeTab === 'goals' && <GoalTracker user={user} />}
                {activeTab === 'progress' && <WeeklyProgress user={user} />}
            </div>
            {/* 💥 NEW Consent Modal 💥 */}
            {showConsentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-center">
                        <div className="mb-6">
                            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">We've Noticed a Pattern</h3>
                            <p className="text-gray-600">
                                Your recent mood logs and emotional patterns suggest you might benefit from the support of a human counselor. Would you like to be assigned one?
                            </p>
                        </div>
                        <div className="mb-6">
                            <label className="flex items-center justify-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={giveDataAccess}
                                    onChange={(e) => setGiveDataAccess(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    I give my consent for my counselor to view my journal and mood data.
                                </span>
                            </label>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => handleConsent(false)}
                                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Not Right Now
                            </button>
                            <button
                                onClick={() => handleConsent(true)}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                            >
                                Yes, Assign Me
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;