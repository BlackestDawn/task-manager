'use client';
import { useState, useTransition} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import HamburgerButton from "./hamburgermenu";
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
    <div className="pt-5">
      <div className="flex items-center justify-between mb-4 pr-4 pl-4">
        <h1 className="font-bold font-serif text-5xl mb-4 text-left flex-1 md:text-center md:justify-center">
          Task Manager
        </h1>
        <HamburgerButton isOpen={isMenuOpen} onClick={toggleMenu} />
      </div>

      <nav>
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center justify-center text-lg font-semibold">
          {menuItems.map((link) => (
            <li
              key={link.href}
              className="border-t-2 border-r-2 border-l-2 border-gray-900 dark:border-gray-200 p-2 rounded-t-xl hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              {link.label === "Logout" ? (
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="gap-2 hover:underline hover:underline-offset-4 disabled:opacity-50"
                >
                  {isPending ? "Logging out..." : link.label}
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="gap-2 hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col border-t border-gray-200 dark:border-gray-700">
            {menuItems.map((link) => (
              <li
                key={link.href}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                {link.label === "Logout" ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    disabled={isPending}
                    className="block w-full text-center px-4 py-3 text-lg font-semibold transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isPending ? "Logging out..." : link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block px-4 py-3 text-lg font-semibold transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}