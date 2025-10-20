export interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export interface HeaderNavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export interface MenuItem {
  href: string;
  label: string;
  action?: string;
}
