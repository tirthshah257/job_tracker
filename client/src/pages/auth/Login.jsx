import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to login. Please check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@college.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 text-white items-center justify-center font-bold text-xl mb-3 shadow-md">
            JT
          </div>
          <h2 className="text-2xl font-bold text-gray-900">College Job Tracker</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@college.com or student@college.edu"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full py-2.5 mt-2">
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Student without an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </p>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left">
            <p className="text-xs font-semibold text-gray-700 mb-1">Default Admin Credentials:</p>
            <p className="text-xs text-gray-600">Email: <span className="font-mono">admin@college.com</span></p>
            <p className="text-xs text-gray-600">Password: <span className="font-mono">admin123</span></p>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Fill Admin Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

