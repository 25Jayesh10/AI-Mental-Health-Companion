export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'counselor';
  avatar?: string;
  assignedCounselor?: string;
  patients?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: number; // 1-10 scale
  emotions: string[];
  notes?: string;
  type: 'quick' | 'detailed';
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'kai';
  content: string;
  timestamp: string;
  type: 'text' | 'suggestion' | 'exercise';
  metadata?: {
    moodDetected?: number;
    emotionsDetected?: string[];
    exerciseType?: string;
  };
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDays: number;
  currentStreak: number;
  completedDays: number;
  category: 'sleep' | 'exercise' | 'mindfulness' | 'social' | 'journaling';
  isActive: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  type: 'mood_pattern' | 'crisis_detected' | 'goal_milestone' | 'check_in_missed';
  message: string;
  timestamp: string;
  resolved: boolean;
  counselorNotified: boolean;
}

export interface WeeklyReport {
  userId: string;
  weekStarting: string;
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  topEmotions: string[];
  goalsProgress: { goalId: string; progress: number }[];
  keyInsights: string[];
  suggestedTopics: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}