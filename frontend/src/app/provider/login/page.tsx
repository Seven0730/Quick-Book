'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import { useProviderContext } from '@/contexts/ProviderContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ProviderIdInput } from '@/components/ProviderIdInput';

export default function ProviderLoginPage() {
  const router = useRouter();
  const { setIsAuthenticated } = useUserContext();
  const { setProviderId } = useProviderContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (id: number) => {
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
            <ProviderIdInput onSubmit={handleLogin} loading={isSubmitting} />
          </div>

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