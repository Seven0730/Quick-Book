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
    <aside className="w-64 min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 p-4 flex flex-col shadow-xl rounded-r-3xl">
      <div className="flex-1">
        {/* User Info */}
        <div className="mb-6 p-4 bg-white/80 rounded-2xl shadow-lg flex flex-col items-center">
          <div className="text-xs text-pink-500 font-bold mb-1 tracking-wide uppercase">
            {userRole === 'customer' ? 'Customer' : 'Provider'}
          </div>
          {userRole === 'provider' && providerId && (
            <div className="font-semibold text-blue-700 text-lg">
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
                  `block px-4 py-2 font-bold rounded-xl transition-all duration-200 shadow-md ` +
                  (activeModule
                    ? 'bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white scale-105 shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-pink-200 hover:via-blue-200 hover:to-yellow-100 hover:scale-105')
                }
              >
                {m.label}
              </Link>
              {activeModule && (
                <nav className="mt-2 ml-2 space-y-1">
                  {m.children.map((c) => {
                    const active = pathname === c.path;
                    return (
                      <Link
                        key={c.path}
                        href={c.path}
                        className={
                          `block px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 ` +
                          (active
                            ? 'bg-gradient-to-r from-pink-400 via-blue-400 to-yellow-300 text-white scale-105 shadow'
                            : 'bg-white/70 text-gray-700 hover:bg-gradient-to-r hover:from-pink-200 hover:via-blue-200 hover:to-yellow-100 hover:scale-105')
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
      <div className="space-y-2 pt-4 border-t border-pink-200">
        <button
          onClick={handleSwitchRole}
          className="w-full px-4 py-2 text-sm font-bold text-pink-600 bg-white/80 rounded-xl shadow hover:bg-gradient-to-r hover:from-pink-200 hover:via-blue-200 hover:to-yellow-100 hover:scale-105 transition-all duration-200"
        >
          🎭 Switch Role
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-bold text-red-600 bg-white/80 rounded-xl shadow hover:bg-gradient-to-r hover:from-pink-200 hover:via-blue-200 hover:to-yellow-100 hover:scale-105 transition-all duration-200"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
