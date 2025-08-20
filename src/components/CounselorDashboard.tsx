import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingDown, TrendingUp, Calendar, Brain, Heart, Activity, Send, BookOpen, Smile, Target } from 'lucide-react';
import { User } from '../types';

interface CounselorDashboardProps {
  user: User;
}

interface PatientData {
  id: string;
  name: string;
  moodTrend: string;
  riskLevel: string;
  averageMood: number;
  streak: number;
  recentAlerts: number;
  lastActivity?: string;
  nextSession?: string;
  // 💥 Adding a flag to track if consent is given
  data_access_granted?: boolean;
}

interface AlertData {
  name: string;
  message: string;
  severity: string;
  time: string;
}

interface DashboardStats {
  total_patients: number;
  active_alerts: number;
}

// 💥 Interface for the detailed patient data
interface PatientDetails {
  mood_entries: { mood: string; created_at: string; emotions: string }[];
  journal_entries: { title: string; content: string; created_at: string }[];
  goals: { description: string; is_completed: boolean }[];
}


const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ user }) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost/ai_companion_backend/api/counselor_dashboard.php?counselor_id=${user.id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      const fetchedPatients = (data.patients || []).map((p: any) => ({
          id: p.id,
          name: p.username,
          moodTrend: p.moodTrend,
          riskLevel: p.riskLevel,
          averageMood: 7.0, // Placeholder
          streak: p.streak,
          lastActivity: "Just now", // Placeholder
          recentAlerts: p.recentAlerts,
          nextSession: "2024-01-15", // Placeholder
          data_access_granted: p.data_access_granted === 1 // 💥 Check consent
      }));

      setPatients(fetchedPatients);
      setDashboardStats(data.dashboardStats);
      setRecentAlerts((data.recentAlerts || []).map((a: any) => ({
          patientName: a.username,
          message: a.message,
          severity: a.severity,
          time: "just now" // Placeholder
      })));
      
    } catch (err) {
      console.error("Failed to fetch counselor data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId: string) => {
    setIsDetailsLoading(true);
    try {
        const response = await fetch(`http://localhost/ai_companion_backend/api/patient_details.php?patient_id=${patientId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch patient details.');
        }
        const data = await response.json();
        setSelectedPatientDetails(data);
    } catch (err) {
        console.error("Failed to fetch patient details:", err);
        setError("Failed to load patient details.");
        setSelectedPatientDetails(null);
    } finally {
        setIsDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'counselor') {
      fetchDashboardData();
    }
  }, [user]);

  const handlePatientClick = (patient: PatientData) => {
    setSelectedPatient(patient);
    if (patient.data_access_granted) {
      fetchPatientDetails(patient.id);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPatient) return;

    setIsSending(true);
    setSendSuccess(null);
    setError(null);

    const messageData = {
      counselor_id: user.id,
      patient_id: selectedPatient.id,
      message: messageText
    };

    try {
      const response = await fetch('http://localhost/ai_companion_backend/api/counselor_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message.');
      }
      setSendSuccess('Message sent successfully!');
      setMessageText('');
      setTimeout(() => setShowSendMessageModal(false), 2000);
      
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '�';
  };

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Good morning, {user.name}</h1>
            <p className="text-indigo-100">
              You have {dashboardStats?.active_alerts} patients requiring attention.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className={`w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-3`}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{dashboardStats?.total_patients}</div>
          <div className="text-sm font-medium text-gray-700 mb-1">Total Patients</div>
          <div className="text-xs text-gray-500">Under your care</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className={`w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-3`}>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{dashboardStats?.active_alerts}</div>
          <div className="text-sm font-medium text-gray-700 mb-1">Active Alerts</div>
          <div className="text-xs text-gray-500">Requiring attention</div>
        </div>
        {/* Placeholder for other stats */}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Your Patients</h2>
            <p className="text-sm text-gray-500 mt-1">Monitor patient progress and wellness</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-6 cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">Last active: {patient.lastActivity}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(patient.moodTrend)}
                          <span className="text-xs text-gray-600 capitalize">{patient.moodTrend}</span>
                        </div>
                        <span className="text-xs text-gray-600">Mood: {patient.averageMood}/10</span>
                        <span className="text-xs text-gray-600">{patient.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className={`px-2 py-1 text-xs rounded-full border ${getRiskLevelColor(patient.riskLevel)}`}>
                      {patient.riskLevel} risk
                    </div>
                    {patient.recentAlerts > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-amber-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{patient.recentAlerts} alert{patient.recentAlerts > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Next: {patient.nextSession}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
            <p className="text-sm text-gray-500 mt-1">Requires your attention</p>
          </div>
          
          <div className="p-6 space-y-4">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity}
                  </div>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">{alert.patientName}</h4>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            ))}
            
            <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all alerts
            </button>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPatient?.name} - Patient Details
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {isDetailsLoading && <div className="text-center text-gray-500">Loading patient data...</div>}
              {selectedPatientDetails && selectedPatient.data_access_granted ? (
                <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-1">Last Mood</h3>
                    <p className="text-2xl font-bold text-blue-600">{selectedPatientDetails.mood_entries[0]?.mood || 'N/A'}/10</p>
                    <p className="text-sm text-blue-600">{new Date(selectedPatientDetails.mood_entries[0]?.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-1">Active Goals</h3>
                    <p className="text-2xl font-bold text-green-600">{selectedPatientDetails.goals?.filter(g => !g.is_completed).length}</p>
                    <p className="text-sm text-green-600">Patient's active goals</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Journal Entries</h3>
                  <div className="space-y-2">
                    {(selectedPatientDetails.journal_entries || []).slice(0, 3).map((entry, index) => (
                      <div key={index} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Suggested Topics</h3>
                  <div className="space-y-2">
                     {/* Simplified insight generation for demo */}
                     <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                       <p className="text-sm text-yellow-800">Discuss recent mood fluctuations and triggers</p>
                     </div>
                  </div>
                </div>
                </>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Patient has not granted consent to view their data yet.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setShowSendMessageModal(true);
                  setSelectedPatient(selectedPatient); // Make sure patient context is carried over
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Nudge
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 💥 NEW Send Message Modal 💥 */}
      {showSendMessageModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Send Message to {selectedPatient.name}
                </h3>
                <button
                  onClick={() => setShowSendMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                  rows={4}
                  required
                />
                
                {sendSuccess && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{sendSuccess}</div>}
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <div className="flex justify-end space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50"
                    disabled={isSending || !messageText.trim()}
                  >
                    {isSending ? 'Sending...' : (
                      <>
                        <Send className="w-4 h-4 inline mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default CounselorDashboard;