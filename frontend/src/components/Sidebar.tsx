'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import { useProviderContext } from '@/contexts/ProviderContext';
import { toast } from 'react-hot-toast';

interface SubLink { label: string; path: string }

const customerModules = [
  {
    label: 'Customer',
    path: '/customer',
    children: [
      { label: 'Quick-Book', path: '/customer/quick-book' },
      { label: 'Post & Quote', path: '/customer/post-quote' },
      { label: 'History', path: '/customer/history' },
    ] as SubLink[],
  },
];

const providerModules = [
  {
    label: 'Provider',
    path: '/provider',
    children: [
      { label: 'Quick-Book', path: '/provider/quick-book' },
      { label: 'Post & Quote', path: '/provider/post-quote' },
      { label: 'History', path: '/provider/history' },
    ] as SubLink[],
  },
];

export function Sidebar() {
  const pathname = usePathname()!;
  const router = useRouter();
  const { userRole, setUserRole, setIsAuthenticated } = useUserContext();
  const { providerId, setProviderId } = useProviderContext();

  const modules = userRole === 'customer' ? customerModules : providerModules;

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    if (userRole === 'provider') {
      setProviderId(null);
    }
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleSwitchRole = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    if (userRole === 'provider') {
      setProviderId(null);
    }
    router.push('/');
  };

  return (
    <aside className="w-60 bg-gray-100 p-4 flex flex-col">
      <div className="flex-1">
        {/* User Info */}
        <div className="mb-6 p-3 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">
            {userRole === 'customer' ? 'Customer' : 'Provider'}
          </div>
          {userRole === 'provider' && providerId && (
            <div className="font-semibold text-gray-900">
              Provider #{providerId}
            </div>
          )}
        </div>

        {/* Navigation */}
        {modules.map((m) => {
          const activeModule = pathname.startsWith(m.path);
          return (
            <div key={m.path} className="mb-4">
              <Link
                href={m.path}
                className={
                  `block px-3 py-2 font-semibold rounded ` +
                  (activeModule ? 'bg-gray-300' : 'hover:bg-gray-200')
                }
              >
                {m.label}
              </Link>
              {activeModule && (
                <nav className="mt-2 ml-4 space-y-1">
                  {m.children.map((c) => {
                    const active = pathname === c.path;
                    return (
                      <Link
                        key={c.path}
                        href={c.path}
                        className={
                          `block px-2 py-1 rounded text-sm ` +
                          (active ? 'bg-gray-400 font-medium' : 'hover:bg-gray-200')
                        }
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleSwitchRole}
          className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
        >
          Switch Role
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
