import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingDown, TrendingUp, Calendar, Brain, Heart, Activity } from 'lucide-react';
import { User } from '../types';

interface CounselorDashboardProps {
  user: User;
}

// Define data types for the fetched data
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

const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ user }) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost/ai_companion_backend/api/counselor_dashboard.php?counselor_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Map the backend data to your frontend interfaces
        const fetchedPatients = data.patients.map((p: any) => ({
            id: p.id,
            name: p.username,
            moodTrend: p.moodTrend,
            riskLevel: p.riskLevel,
            averageMood: 7.0, // This needs to be calculated in the backend
            streak: p.streak,
            lastActivity: "Just now", // Placeholder
            recentAlerts: p.recentAlerts,
            nextSession: "2024-01-15" // Placeholder
        }));

        setPatients(fetchedPatients);
        setDashboardStats(data.dashboardStats);
        setRecentAlerts(data.recentAlerts.map((a: any) => ({
            patientName: a.name,
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

    if (user && user.role === 'counselor') {
      fetchDashboardData();
    }
  }, [user]);
  
  // You would need another API call here to fetch detailed patient data
  // when a patient is selected, and then display it in the modal.

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
                  selectedPatient === patient.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {patient.name.split(' ').map(n => n[0]).join('')}
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

      {/* Patient Detail Modal (This part will need a dedicated API call to populate) */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {patients.find(p => p.id === selectedPatient)?.name} - Patient Details
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
              {/* This section still uses hard-coded demo data.
              To make this dynamic, you'll need another API call to get details for the `selectedPatient`. */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-1">Weekly Average Mood</h3>
                  <p className="text-2xl font-bold text-blue-600">7.2/10</p>
                  <p className="text-sm text-blue-600">↑ 0.3 from last week</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-1">Current Streak</h3>
                  <p className="text-2xl font-bold text-green-600">14 days</p>
                  <p className="text-sm text-green-600">Personal best!</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Journal Insights</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Patient expressing more gratitude in daily entries</p>
                  <p>• Work stress mentioned 3 times this week</p>
                  <p>• Sleep quality improving (mentioned 5 times)</p>
                  <p>• Social activities increasing</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recommended Session Topics</h3>
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">Explore work stress coping strategies</p>
                  </div>
                  <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">Reinforce positive sleep hygiene habits</p>
                  </div>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">Discuss increased social engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorDashboard;