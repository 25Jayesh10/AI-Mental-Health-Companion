import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Heart, Target, Calendar, Award, Activity } from 'lucide-react';
import { User } from '../types';

interface WeeklyProgressProps {
  user: User;
}

// Define the shape of the data we expect from the backend
interface WeeklyData {
    weekStarting: string;
    averageMood: number;
    moodTrend: 'improving' | 'declining' | 'stable';
    topEmotions: string[];
    checkInStreak: number;
    goalsCompleted: number;
    totalSessions: number;
    keyInsights: string[];
    moodHistory: { day: string; mood: number; emotions: string[] }[];
}

interface DashboardData {
    mood_entries: any[];
    journal_entries: any[];
    goals: any[];
    calculated_average_mood: number;
    weeklyGoals: number;
}


const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ user }) => {
    const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeeklyData = async () => {
            setIsLoading(true);
            setError(null);
            const now = new Date();
            const startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            const endDate = new Date();
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            try {
                const response = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}&start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch weekly data.');
                }
                const data: DashboardData = await response.json();

                // Process the raw data from the backend into the required weekly report format
                const processedData: WeeklyData = processBackendData(data);
                setWeeklyData(processedData);

            } catch (err) {
                console.error("API call failed:", err);
                setError("Failed to load weekly report data.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.id) {
            fetchWeeklyData();
        }
    }, [user.id]);

    // Helper function to process raw backend data
    const processBackendData = (data: DashboardData): WeeklyData => {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        
        const last7DaysMoods = data.mood_entries
            .filter((entry: any) => new Date(entry.created_at) >= startOfWeek)
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            
        const moodHistory = last7DaysMoods.map((entry: any) => ({
            day: new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: parseInt(entry.mood),
            emotions: entry.emotions?.split(', ') || []
        }));

        const averageMood = data.calculated_average_mood;
            
        const moodTrend = averageMood > 6 ? 'improving' : averageMood < 5 ? 'declining' : 'stable';

        const checkInStreak = last7DaysMoods.length;

        const goalsCompleted = data.weeklyGoals || 0;

        const keyInsights = [
            `Your average mood this week was ${averageMood.toFixed(1)}/10.`,
            `You checked in ${checkInStreak} times.`,
        ];
        
        // Calculate top emotions
        const emotionCount: { [key: string]: number } = {};
        last7DaysMoods.forEach(entry => {
            if (entry.emotions) {
                entry.emotions.split(',').forEach((emotion: string) => {
                    const trimmedEmotion = emotion.trim();
                    if (trimmedEmotion) {
                        emotionCount[trimmedEmotion] = (emotionCount[trimmedEmotion] || 0) + 1;
                    }
                });
            }
        });
        const topEmotions = Object.keys(emotionCount).sort((a, b) => emotionCount[b] - emotionCount[a]).slice(0, 4);


        return {
            weekStarting: startOfWeek.toISOString(),
            averageMood,
            moodTrend,
            topEmotions,
            checkInStreak,
            goalsCompleted,
            totalSessions: 0, // This would come from a conversation log
            keyInsights,
            moodHistory
        };
    };

    const getMoodEmoji = (mood: number) => {
        if (mood >= 8) return '😊';
        if (mood >= 6) return '🙂';
        if (mood >= 4) return '😐';
        return '😔';
    };

    const getMoodColor = (mood: number) => {
        if (mood >= 8) return 'bg-green-500';
        if (mood >= 6) return 'bg-yellow-500';
        if (mood >= 4) return 'bg-orange-500';
        return 'bg-red-500';
    };

    if (isLoading) {
        return <div className="text-center py-10 text-gray-500">Generating your weekly report...</div>;
    }

    if (error || !weeklyData) {
        return <div className="text-center py-10 text-red-500">Failed to load weekly report.</div>;
    }
    
    const achievements = [
        { title: `${weeklyData.checkInStreak}-Day Check-in Streak`, icon: Award, color: 'text-yellow-600' },
        { title: `${weeklyData.moodTrend === 'improving' ? 'Mood Improvement' : 'Stable Mood'}`, icon: weeklyData.moodTrend === 'improving' ? TrendingUp : TrendingDown, color: weeklyData.moodTrend === 'improving' ? 'text-green-600' : 'text-red-600' },
        { title: `${weeklyData.goalsCompleted} Goals Completed`, icon: Target, color: 'text-blue-600' },
        { title: 'Consistent Sleep Schedule', icon: Activity, color: 'text-purple-600' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Weekly Progress Report</h2>
                        <p className="text-indigo-100">
                            Week of {new Date(weeklyData.weekStarting).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                        {weeklyData.averageMood.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Average Mood</div>
                    <div className="flex items-center justify-center space-x-1">
                        {weeklyData.moodTrend === 'improving' ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs ${
                            weeklyData.moodTrend === 'improving' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {weeklyData.moodTrend}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {weeklyData.checkInStreak}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                    <div className="text-xs text-green-600 mt-1">Daily check-ins</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                        {weeklyData.goalsCompleted}
                    </div>
                    <div className="text-sm text-gray-600">Goals Completed</div>
                    <div className="text-xs text-purple-600 mt-1">This week</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                        {weeklyData.totalSessions}
                    </div>
                    <div className="text-sm text-gray-600">AI Sessions</div>
                    <div className="text-xs text-orange-600 mt-1">Great engagement</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Mood Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Mood Tracking</h3>
                    
                    <div className="space-y-3">
                        {weeklyData.moodHistory.map((day, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 text-center text-sm font-medium text-gray-600">
                                        {day.day}
                                    </div>
                                    <div className="text-xl">{getMoodEmoji(day.mood)}</div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getMoodColor(day.mood)}`}
                                                style={{ width: `${(day.mood / 10) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900">{day.mood}/10</div>
                                    <div className="text-xs text-gray-500">
                                        {day.emotions.slice(0, 2).join(', ')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Insights */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                    
                    <div className="space-y-3">
                        {weeklyData.keyInsights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-blue-800">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Achievements & Top Emotions */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Achievements */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Achievements</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <achievement.icon className={`w-6 h-6 ${achievement.color} mb-2`} />
                                <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Emotions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Emotions</h3>
                    
                    <div className="space-y-3">
                        {weeklyData.topEmotions.map((emotion, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">{emotion}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                                            style={{ width: `${(4 - index) * 25}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">{4 - index}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations for Next Week</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Continue Sleep Routine</div>
                                <div className="text-sm text-gray-600">Your sleep improvements are boosting your mood</div>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Stress Management</div>
                                <div className="text-sm text-gray-600">Consider discussing work stress coping strategies</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Target className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Social Activities</div>
                                <div className="text-sm text-gray-600">Keep building on your social connections</div>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Activity className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Mindfulness Goal</div>
                                <div className="text-sm text-gray-600">You're close to completing your meditation challenge</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyProgress;