'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ModuleLink {
  label:   string;
  path:    string;
  children?: { label: string; path: string }[];
}

const modules: ModuleLink[] = [
  {
    label: 'Customer',
    path:  '/customer',
    children: [
      { label: 'My Jobs',     path: '/customer' },
      { label: 'Create Job',  path: '/customer/create' },
    ]
  },
  {
    label: 'Provider',
    path:  '/provider',
    children: [
      { label: 'Dashboard',   path: '/provider' },
      // you can add more provider sub-links here
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname() || '';

  return (
    <aside className="w-56 bg-gray-100 p-4">
      <nav className="space-y-4">
        {modules.map((mod) => {
          const activeModule = pathname.startsWith(mod.path);
          return (
            <div key={mod.path}>
              <Link
                href={mod.path}
                className={
                  `block px-3 py-2 rounded font-medium ` +
                  (activeModule ? 'bg-gray-300' : 'hover:bg-gray-200')
                }
              >
                {mod.label}
              </Link>

              {/* If we’re in this module, show its children */}
              {activeModule && mod.children && (
                <div className="mt-1 ml-4 space-y-1">
                  {mod.children.map((sub) => {
                    const activeChild = pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={
                          `block px-2 py-1 rounded text-sm ` +
                          (activeChild ? 'bg-gray-400 font-semibold' : 'hover:bg-gray-200')
                        }
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
