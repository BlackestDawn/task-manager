import type { HamburgerButtonProps } from "@/lib/data/interfaces/navigation";
import { Menu, X } from "lucide-react";

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover-bg-gray-700 focus:outline-none focus:ring-2 focus:ring-insert focus-ring-indigo-500 transition-colors duration-200 "
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X />
        ) : (
          <Menu />
        )}
    </button>
  );
}
