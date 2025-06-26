'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SubLink { label: string; path: string }

const modules = [
  {
    label: 'Customer',
    path: '/customer',
    children: [
      { label: 'Quick-Book', path: '/customer/quick-book' },
      { label: 'Post & Quote', path: '/customer/post-quote' },
    ] as SubLink[],
  },
  {
    label: 'Provider',
    path: '/provider',
    children: [
      { label: 'Quick-Book', path: '/provider/quick-book' },
      // future: { label: 'Bidding', path: '/provider/bids' }
    ] as SubLink[],
  },
];

export function Sidebar() {
  const pathname = usePathname()!;
  return (
    <aside className="w-60 bg-gray-100 p-4">
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
    </aside>
  );
}
