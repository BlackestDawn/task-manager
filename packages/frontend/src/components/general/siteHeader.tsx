'use client'
import { useState } from "react"
import HeaderNavbar from "./headerbar"
import HamburgerButton from "./hamburgermenu";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="pt-5">
      <div className="flex items-center justify-between mb-4 pr-4 pl-4">
        <h1 className="font-bold font-serif text-5xl mb-4 text-left flex-1 md:text-center md:justify-center">Task Manager</h1>
        <HamburgerButton isOpen={isMenuOpen} onClick={toggleMenu} />
      </div>
      <HeaderNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </div>
  )
}
