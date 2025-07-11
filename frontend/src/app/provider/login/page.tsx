'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import { useProviderContext } from '@/contexts/ProviderContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ProviderLoginPage() {
  const router = useRouter();
  const { setIsAuthenticated } = useUserContext();
  const { setProviderId } = useProviderContext();
  const [providerIdInput, setProviderIdInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const id = Number(providerIdInput);
    
    if (!providerIdInput || isNaN(id) || id <= 0) {
      toast.error('Please enter a valid provider ID');
      return;
    }

    setIsSubmitting(true);
    
    try {
      setProviderId(id);
      setIsAuthenticated(true);
      
      toast.success(`Welcome, Provider #${id}!`);
      router.push('/provider');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🔧</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Login
          </h1>
          <p className="text-gray-600">
            Enter your provider ID to access your dashboard
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="providerId" className="block text-sm font-medium text-gray-700 mb-2">
              Provider ID
            </label>
            <input
              id="providerId"
              type="number"
              placeholder="Enter your provider ID"
              value={providerIdInput}
              onChange={(e) => setProviderIdInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={!providerIdInput || isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center">
            <Link
              href="/"
              className="text-green-600 hover:text-green-500 text-sm font-medium"
            >
              ← Back to role selection
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Don&apos;t have a provider ID? Contact support to get registered.</p>
        </div>
      </div>
    </div>
  );
} 