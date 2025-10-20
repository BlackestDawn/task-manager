'use client';
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import HamburgerButton from "./hamburgerButton";
import menuData from "@/lib/data/menuOptions.json";

interface HeaderComponentProps {
  isAuthenticated: boolean;
}

export default function HeaderComponent({ isAuthenticated }: HeaderComponentProps) {
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  };

  const menuItems = [
    ...menuData.menu,
    isAuthenticated
      ? { label: "Logout", href: "#", action: handleLogout }
      : { label: "Login", href: "/login" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between md:justify-center py-4">
        <h1 className="font-bold font-serif text-4xl sm:text-5xl text-gray-900 dark:text-white">
          Task Manager
        </h1>
        <HamburgerButton isOpen={isMenuOpen} onClick={toggleMenu} />
      </div>

      <nav className="pb-4">
        {/* Desktop Navigation */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow">
          <ul className="flex items-center justify-center">
            {menuItems.map((link, index) => (
              <li
                key={link.href}
                className={`flex-1 ${index !== 0 ? "border-l border-gray-200 dark:border-gray-700" : ""}`}
              >
                {link.label === "Logout" ? (
                  <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 rounded-lg"
                  >
                    {isPending ? "Logging out..." : link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="block w-full px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 rounded-lg"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {menuItems.map((link) => (
                <li key={link.href}>
                  {link.label === "Logout" ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      disabled={isPending}
                      className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isPending ? "Logging out..." : link.label}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block px-4 py-3 text-center text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}