'use client';
import Link from "next/link"
import data from "@/lib/data/menuOptions.json";
import { usePathname, useRouter } from "next/navigation";
import type { HeaderNavbarProps, MenuItem } from "@/lib/data/interfaces/navigation";
import { useAuthContext } from "../auth/clientAuthProvider";
import { useLogout } from "@/lib/api/auth/queries";

export default function HeaderNavbar({ isMenuOpen, setIsMenuOpen }: HeaderNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const logoutMutation = useLogout();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/");
      closeMenu();
    }
  };

  const menuItems: MenuItem[] = [ ...data.menu, isAuthenticated
    ? {href: "#", label: "Logout", action: "logout"}
    : {href: "/login", label: "Login"} ];

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action === "logout") {
      handleLogout();
    } else {
      closeMenu();
    }
  }

  return (
    <nav className="">
      {/* Desktop */}
      <ul className="hidden md:flex items-center justify-center text-lg font-semibold">
        {menuItems.map((link) => (
          <li key={link.href} className={`border-t-2 border-r-2 border-l-2 border-gray-900 dark:border-gray-200 p-2 rounded-t-xl
            ${isActive(link.href) ? 'bg-gray-900 dark:bg-gray-200' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}
          `}>
            {link.action === "logout" ? (
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className={`gap-2 hover:underline hover:underline-offset-4 disabled:opacity-50
                  ${isActive(link.href) ? 'text-white dark:text-gray-900' : ''}
                `}
              >
                {logoutMutation.isPending ? 'Logging out...' : link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className={`gap-2 hover:underline hover:underline-offset-4
                  ${isActive(link.href) ? 'text-white dark:text-gray-900' : ''}
                `}
              >
                {link.label}
              </Link>
            )}
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
          {menuItems.map((link) => (
            <li key={link.href} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {link.action === "logout" ? (
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className={`block w-full text-center px-4 py-3 text-lg font-semibold transition-colors duration-200 disabled:opacity-50
                    ${isActive(link.href)
                      ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900'
                      : 'hover:bg-gray-300 dark:hover:bg-gray-700'}
                  `}
                >
                  {logoutMutation.isPending ? 'Logging out...' : link.label}
                </button>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => handleMenuItemClick(link)}
                  className={`block px-4 py-3 text-lg font-semibold transition-colors duration-200
                    ${isActive(link.href)
                      ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900'
                      : 'hover:bg-gray-300 dark:hover:bg-gray-700'}
                  `}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
