import React, { useState, useEffect } from 'react';
import { BookOpen, Edit, ThumbsUp, X, Smile } from 'lucide-react';
import { User, MoodEntry } from '../types';

interface JournalingProps {
  user: User;
}

interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood: number;
  moodEmoji: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at: string;
}

const Journaling: React.FC<JournalingProps> = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😞';
  };

  const fetchJournalEntries = async () => {
      setIsLoading(true);
      setError(null);
      try {
          const response = await fetch(`http://localhost/ai_companion_backend/api/dashboard.php?user_id=${user.id}`);
          if (!response.ok) {
              throw new Error('Failed to fetch journal entries.');
          }
          const data = await response.json();
          // 💥 Safely access the data and store it
          setJournalEntries(data.journal_entries || []);
      } catch (err) {
          console.error("API call failed:", err);
          setError("Failed to load journal entries.");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchJournalEntries();
    }
  }, [user.id]);


  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const newJournalEntry = {
        user_id: user.id,
        title: newEntry.title,
        content: newEntry.content,
    };

    try {
        const response = await fetch('http://localhost/ai_companion_backend/api/journal.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newJournalEntry),
        });

        const result = await response.json();

        if (response.ok) {
            // Re-fetch data to update the journal list with the new entry
            await fetchJournalEntries();

            // Close the modal and reset form
            setShowModal(false);
            setNewEntry({ title: '', content: '' });
        } else {
            setError(result.message || 'Failed to save journal entry.');
        }

    } catch (err) {
        console.error("API call failed:", err);
        setError("A network error occurred. Please try again.");
    } finally {
        setIsSaving(false);
    }
 };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading your journal...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Journal</h2>
          <p className="text-gray-600">A space to reflect and track your thoughts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="grid gap-4">
        {journalEntries.length > 0 ? (
          journalEntries.map((entry, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-2xl">
                  <Smile className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor('neutral')}`}>
                {entry.sentiment}
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{entry.content}</p>
          </div>
        ))
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No journal entries found. Click "New Entry" to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">New Journal Entry</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., A productive day"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Thoughts</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Write down your thoughts and feelings..."
                  rows={5}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journaling;