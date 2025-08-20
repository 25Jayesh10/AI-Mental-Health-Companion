import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Circle, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { User, Goal } from '../types';

interface GoalTrackerProps {
  user: User;
}

// Define the shape of the data we expect from the backend
interface DashboardData {
  mood_entries: any[];
  journal_entries: any[];
  goals: Goal[];
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ user }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'mindfulness' as Goal['category'],
    targetDays: 7
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals from the backend when the component mounts
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch goals.');
        }
        const data = await response.json();
        setDashboardData(data); // Store the entire dashboard object
      } catch (err) {
        setError("Failed to load goals. Please try again.");
        console.error("API call failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, [user.id]);

  const categories = [
    { value: 'mindfulness', label: 'Mindfulness', color: 'bg-purple-100 text-purple-700', icon: '🧘' },
    { value: 'exercise', label: 'Exercise', color: 'bg-orange-100 text-orange-700', icon: '💪' },
    { value: 'sleep', label: 'Sleep', color: 'bg-blue-100 text-blue-700', icon: '😴' },
    { value: 'social', label: 'Social', color: 'bg-green-100 text-green-700', icon: '👥' },
    { value: 'journaling', label: 'Journaling', color: 'bg-yellow-100 text-yellow-700', icon: '📝' }
  ];

  const getCategoryInfo = (category: Goal['category']) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const goalData = {
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description,
      target_days: newGoal.targetDays, // Matches backend snake_case
      category: newGoal.category
    };

    try {
      const response = await fetch('http://localhost/ai_companion_backend/api/goals.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add goal.');
      }
      
      // Re-fetch goals to update the UI
      const updatedGoalsResponse = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}`);
      const updatedData = await updatedGoalsResponse.json();
      setDashboardData(updatedData);

      setNewGoal({ title: '', description: '', category: 'mindfulness', targetDays: 7 });
      setShowAddGoal(false);

    } catch (err) {
      console.error("API call failed:", err);
      setError("Failed to add goal. Please try again.");
    }
  };

  const toggleGoalCompletion = async (goalId: string) => {
    setError(null);
    try {
      const goalToUpdate = dashboardData?.goals.find(g => g.id === goalId);
      if (!goalToUpdate) return;

      const response = await fetch('http://localhost/ai_companion_backend/api/goals.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_completion',
          goal_id: goalId,
          is_completed: !goalToUpdate.is_completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal completion.');
      }
      
      // Re-fetch to update the UI
      const updatedGoalsResponse = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}`);
      const updatedData = await updatedGoalsResponse.json();
      setDashboardData(updatedData);

    } catch (err) {
      console.error("API call failed:", err);
      setError("Failed to update goal. Please try again.");
    }
  };

  const deleteGoal = async (goalId: string) => {
    setError(null);
    try {
      const response = await fetch('http://localhost/ai_companion_backend/api/goals.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: goalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal.');
      }
      
      // Re-fetch to update the UI
      const updatedGoalsResponse = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}`);
      const updatedData = await updatedGoalsResponse.json();
      setDashboardData(updatedData);
      
    } catch (err) {
      console.error("API call failed:", err);
      setError("Failed to delete goal. Please try again.");
    }
  };
  
  // 💥 CHECK FOR LOADING STATE HERE 💥
  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading your goals...</div>;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  // Safely access the goals array from the dashboardData object
  const goals = dashboardData?.goals || [];

  const activeGoals = goals.filter(goal => goal.isActive);
  const completedGoals = goals.filter(goal => !goal.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Wellness Goals</h2>
          <p className="text-gray-600">Track your progress and build healthy habits</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goal Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{activeGoals.length}</div>
          <div className="text-sm text-gray-600">Active Goals</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">
            {activeGoals.length > 0 ? `${Math.round(activeGoals.reduce((sum, goal) => sum + (goal.currentStreak / goal.targetDays), 0) / activeGoals.length * 100)}%` : '0%'}
          </div>
          <div className="text-sm text-gray-600">Avg Progress</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...activeGoals.map(goal => goal.currentStreak), 0)}
          </div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">
            {goals.reduce((sum, goal) => sum + goal.completedDays, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Completed</div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Goals</h3>
        {activeGoals.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active goals yet. Add your first goal to get started!</p>
          </div>
        ) : (
          activeGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category);
            const progress = Math.min((goal.currentStreak / goal.targetDays) * 100, 100);
            
            return (
              <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl">{categoryInfo.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleGoalCompletion(goal.id)}
                      className="p-2 text-green-500 hover:text-green-700 transition-colors"
                      title="Mark as completed today"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress to {goal.targetDays} day target</span>
                      <span className="font-medium">{goal.currentStreak}/{goal.targetDays} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Current streak: {goal.currentStreak} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Total completed: {goal.completedDays} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Goal</h3>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Daily Meditation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Describe what you want to achieve..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Days</label>
                <select
                  value={newGoal.targetDays}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDays: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value={7}>7 days (1 week)</option>
                  <option value={14}>14 days (2 weeks)</option>
                  <option value={21}>21 days (3 weeks)</option>
                  <option value={30}>30 days (1 month)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;