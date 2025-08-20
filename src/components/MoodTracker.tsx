import React, { useState } from 'react';
import { Heart, Smile, Meh, Frown, Calendar, TrendingUp } from 'lucide-react';
import { User } from '../types';

interface MoodTrackerProps {
  user: User;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ user }) => {
  const [selectedMood, setSelectedMood] = useState<number>(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const moodEmojis = [
    { value: 1, emoji: '😢', label: 'Very Low', color: 'text-red-500' },
    { value: 2, emoji: '😞', label: 'Low', color: 'text-red-400' },
    { value: 3, emoji: '😐', label: 'Poor', color: 'text-orange-400' },
    { value: 4, emoji: '😕', label: 'Below Average', color: 'text-yellow-400' },
    { value: 5, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { value: 6, emoji: '🙂', label: 'Okay', color: 'text-lime-500' },
    { value: 7, emoji: '😊', label: 'Good', color: 'text-green-400' },
    { value: 8, emoji: '😄', label: 'Great', color: 'text-green-500' },
    { value: 9, emoji: '😁', label: 'Excellent', color: 'text-green-600' },
    { value: 10, emoji: '🤩', label: 'Amazing', color: 'text-green-700' }
  ];

  const emotions = [
    'Happy', 'Sad', 'Anxious', 'Excited', 'Angry', 'Peaceful',
    'Stressed', 'Grateful', 'Lonely', 'Confident', 'Overwhelmed', 'Hopeful'
  ];

  const recentMoods = [
    { date: '2024-01-13', mood: 8, emotions: ['Happy', 'Grateful'], notes: 'Great day at work' },
    { date: '2024-01-12', mood: 6, emotions: ['Neutral', 'Tired'], notes: 'Regular day' },
    { date: '2024-01-11', mood: 7, emotions: ['Excited', 'Confident'], notes: 'Presentation went well' },
    { date: '2024-01-10', mood: 5, emotions: ['Anxious', 'Stressed'], notes: 'Busy day with deadlines' },
    { date: '2024-01-09', mood: 9, emotions: ['Happy', 'Peaceful'], notes: 'Weekend relaxation' },
    { date: '2024-01-08', mood: 7, emotions: ['Content', 'Social'], notes: 'Time with friends' },
    { date: '2024-01-07', mood: 4, emotions: ['Sad', 'Lonely'], notes: 'Missing family' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would save to your backend
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;

  return (
    <div className="space-y-6">
      {/* Current Mood Entry */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">How are you feeling today?</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Rate your mood (1-10)</label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedMood === mood.value
                      ? 'border-blue-500 bg-blue-50 transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs font-medium text-gray-600">{mood.value}</div>
                </button>
              ))}
            </div>
            
            <div className="mt-3 text-center">
              <span className={`text-lg font-medium ${moodEmojis[selectedMood - 1]?.color || 'text-gray-600'}`}>
                {moodEmojis[selectedMood - 1]?.label} ({selectedMood}/10)
              </span>
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What emotions are you experiencing? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => toggleEmotion(emotion)}
                  className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
                    selectedEmotions.includes(emotion)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any additional notes? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind today? Any specific events or thoughts you'd like to record?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105"
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Save Today's Mood
          </button>
        </form>

        {showSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 text-center font-medium">
              ✨ Your mood has been saved! Thanks for checking in today.
            </p>
          </div>
        )}
      </div>

      {/* Mood History */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
          <div className="space-y-3">
            {recentMoods.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{moodEmojis[entry.mood - 1]?.emoji}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.emotions.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-medium ${moodEmojis[entry.mood - 1]?.color}`}>
                    {entry.mood}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mood Insights</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">7-Day Average</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {averageMood.toFixed(1)}/10
              </div>
              <p className="text-sm text-gray-600 mt-1">
                You're trending {averageMood > 6.5 ? 'positively' : averageMood > 5.5 ? 'steady' : 'low'} this week
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-yellow-700">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">85%</div>
                <div className="text-sm text-green-700">Check-in Rate</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Most Common Emotions</h4>
              <div className="flex flex-wrap gap-2">
                {['Happy', 'Grateful', 'Content', 'Excited'].map((emotion) => (
                  <span
                    key={emotion}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;