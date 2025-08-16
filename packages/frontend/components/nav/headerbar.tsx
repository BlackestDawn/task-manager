'use client';
import Link from "next/link"
import data from "@/lib/data/menuOptions.json";
import { usePathname } from "next/navigation";
import type { HeaderNavbarProps } from "@/lib/data/interfaces/navigation";

export default function HeaderNavbar({ isMenuOpen, setIsMenuOpen }: HeaderNavbarProps) {
  const pathname = usePathname();
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  }

  return (
    <nav className="">
      {/* Desktop */}
      <ul className="hidden md:flex items-center justify-center text-lg font-semibold">
        {data["menu"].map((link) => (
          <li key={link.href} className={`border-t-2 border-r-2 border-l-2 border-gray-900 dark:border-gray-200 p-2 rounded-t-xl
            ${isActive(link.href) ? 'bg-gray-900 dark:bg-gray-200' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}
          `}>
            <Link href={link.href} className={`gap-2 hover:underline hover:underline-offset-4
              ${isActive(link.href) ? 'text-white dark:text-gray-900' : ''}
            `}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col border-t border-gray-200 dark:border-gray-700">
          {data["menu"].map((link) => (
            <li key={link.href} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <Link
                href={link.href}
                onClick={closeMenu}
                className={`block px-4 py-3 text-lg font-semibold transition-colors duration-200
                  ${isActive(link.href)
                    ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700'}
                `}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
