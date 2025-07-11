'use client';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';

export function RoleSelectionPage() {
  const router = useRouter();
  const { setUserRole, setIsAuthenticated } = useUserContext();

  const handleRoleSelect = (role: 'customer' | 'provider') => {
    setUserRole(role);
    
    if (role === 'customer') {
      setIsAuthenticated(true);
      toast.success('Welcome! You are now logged in as a customer.');
      router.push('/customer');
    } else {
      // For provider, redirect to login page
      router.push('/provider/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Quick-Book
          </h1>
          <p className="text-gray-600 mb-8">
            Please select your role to continue
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('customer')}
            className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold">Customer</div>
              <div className="text-sm opacity-90">I need services</div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('provider')}
            className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-semibold">Provider</div>
              <div className="text-sm opacity-90">I provide services</div>
            </div>
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Choose your role to get started with Quick-Book services</p>
        </div>
      </div>
    </div>
  );
} 