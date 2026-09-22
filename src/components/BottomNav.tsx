'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/lessons', label: 'Lessons', icon: '📚' },
  { href: '/exam', label: 'Exam', icon: '📝' },
  { href: '/speak', label: 'Speak', icon: '🎙️' },
  { href: '/progress', label: 'Profile', icon: '👤' }
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="flex border-t border-surface2 bg-white">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${
              active ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
