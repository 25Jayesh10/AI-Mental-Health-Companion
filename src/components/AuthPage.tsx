import React, { useState } from 'react';
import { Brain, Heart, Shield, Users, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true); // 💥 Ensure this is set to true
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'patient' as 'patient' | 'counselor',
    primary_concern: 'Anxiety'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const action = isLogin ? 'login' : 'signup';
    const body = {
      action,
      email: formData.email,
      password: formData.password,
      username: formData.name || formData.email.split('@')[0],
      role: formData.role,
      primary_concern: formData.primary_concern
    };

    try {
      const response = await fetch('http://localhost/ai_companion_backend/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        if (action === 'signup') {
          const loginResponse = await fetch('http://localhost/ai_companion_backend/api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username: body.username, password: body.password }),
          });
          const loginResult = await loginResponse.json();
          if (loginResponse.ok) {
            handleSuccessfulLogin(loginResult.user_id, loginResult.role, body.username, body.email);
          } else {
            setError(loginResult.message || 'Signup successful but login failed. Please try logging in.');
          }
        } else {
          handleSuccessfulLogin(result.user_id, result.role, body.username, body.email);
        }
      } else {
        setError(result.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error('API call failed:', err);
      setError('A network error occurred. Please check your connection.');
    }
  };

  const handleSuccessfulLogin = (userId: string, userRole: 'patient' | 'counselor', userName: string, userEmail: string) => {
    const user: User = {
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole
    };
    localStorage.setItem('user_data', JSON.stringify(user));
    onLogin(user);
  };
  
  const demoLogin = (role: 'patient' | 'counselor') => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'patient' ? 'Sarah Johnson' : 'Dr. Emily Chen',
      email: role === 'patient' ? 'sarah@example.com' : 'dr.chen@example.com',
      role
    };
    onLogin(user);
  };

  const commonConcerns = ['Anxiety', 'Stress', 'Depression', 'Grief', 'Relationship Issues', 'Work-Life Balance'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      {/* Left Side - Branding (No changes needed) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Kai</h1>
            <p className="text-xl text-blue-100 mb-8">
              Your intelligent mental health companion, designed to support your journey to wellness.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Personalized Support</h3>
                <p className="text-blue-100 text-sm">AI-powered conversations that adapt to your emotional needs and provide contextual support.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacy-First Design</h3>
                <p className="text-blue-100 text-sm">Your data is encrypted and shared only with your consent. You control your mental health journey.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Professional Integration</h3>
                <p className="text-blue-100 text-sm">Seamless collaboration with your counselor or therapist for comprehensive care.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile Logo (No changes needed) */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">Kai</h1>
              <p className="text-sm text-gray-500">Mental Health Companion</p>
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to continue your mental health journey'
                : 'Create your account to begin your wellness journey'
              }
            </p>
          </div>
          {/* Demo Buttons (No changes needed) */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 mb-3 font-medium">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin('patient')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Demo Patient
              </button>
              <button
                onClick={() => demoLogin('counselor')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                Demo Counselor
              </button>
            </div>
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="patient">Patient</option>
                    <option value="counselor">Counselor</option>
                  </select>
                </div>
                {formData.role === 'patient' && ( // 💥 Only show this for patients
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Concern</label>
                    <select
                      name="primary_concern"
                      value={formData.primary_concern}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    >
                      {commonConcerns.map((concern) => (
                        <option key={concern} value={concern}>{concern}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
          {isLogin && (
            <div className="text-center mt-4">
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;