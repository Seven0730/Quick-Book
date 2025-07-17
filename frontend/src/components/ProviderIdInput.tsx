import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function ProviderIdInput({ onSubmit, loading }: {
  onSubmit: (id: number) => void;
  loading?: boolean;
}) {
  const [providerIdInput, setProviderIdInput] = useState('');

  const handleSubmit = () => {
    const id = Number(providerIdInput);
    if (!providerIdInput || isNaN(id) || id <= 0) {
      toast.error('Please enter a valid provider ID');
      return;
    }
    onSubmit(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
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
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={!providerIdInput || loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
} 