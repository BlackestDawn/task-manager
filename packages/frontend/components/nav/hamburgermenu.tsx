interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export default function HamburgerButton({ isOpen, onClick, className = "" }: HamburgerButtonProps) {
  const baseSpanClasses = "block w-6 h-0.5 bg-gray-900 dark:bg-gray-200 transition-all duration-300";

  return (
    <button
      onClick={onClick}
      className={`md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 ${className}`}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <span className={`${baseSpanClasses} ${isOpen && 'rotate-45 translate-y-2'}`} />
      <span className={`${baseSpanClasses} ${isOpen && 'opacity-0'}`} />
      <span className={`${baseSpanClasses} ${isOpen && '-rotate-45 -translate-y-2'}`} />
    </button>
  );
}
