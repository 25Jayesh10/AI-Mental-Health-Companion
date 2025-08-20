import React, { useState, useEffect } from 'react';
import { Heart, Brain, Users, Shield, Settings, Menu, X } from 'lucide-react';
import AuthPage from './components/AuthPage';
import PatientDashboard from './components/PatientDashboard';
import CounselorDashboard from './components/CounselorDashboard';
import { User, AuthState } from './types'; // Corrected import path

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Check for user data in localStorage on app load
    try {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      // Handle potential JSON parsing errors
      console.error("Failed to parse user data from localStorage:", err);
      localStorage.removeItem('user_data');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const handleLogin = (user: User) => {
    // This is called by the AuthPage on successful login
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false
    });
    // The AuthPage now handles saving to localStorage, but we can double-check here
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  const handleLogout = () => {
    // Clear user data from both state and localStorage
    localStorage.removeItem('user_data');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="text-xl font-medium text-gray-700">Loading Kai...</div>
          <div className="text-sm text-gray-500 mt-2">Your mental health companion</div>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kai</h1>
                <p className="text-xs text-gray-500">Mental Health Companion</p>
              </div>
            </div>

            {/* User Info & Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{authState.user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{authState.user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {authState.user?.name.charAt(0)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="hidden md:block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
              <div className="flex items-center space-x-2 px-2 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {authState.user?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{authState.user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{authState.user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-2 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authState.user?.role === 'patient' && authState.user ? (
          <PatientDashboard user={authState.user} />
        ) : authState.user?.role === 'counselor' && authState.user ? (
          <CounselorDashboard user={authState.user} />
        ) : (
            // Fallback for an unexpected state
            <AuthPage onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;