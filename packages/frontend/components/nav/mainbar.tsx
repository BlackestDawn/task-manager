import Link from "next/link"
import data from "@/app/lib/data/menuOptions.json";

export default function HeaderNavbar() {
  return (
    <nav className="border-b-2 border-gray-200">
      <ul className="flex items-center justify-center text-lg font-semibold">
        {data["menu"].map((link) => (
          <li key={link.href} className="border-t-2 border-r-2 border-l-2 border-gray-200 p-2 rounded-t-xl">
            <Link href={link.href} className="gap-2 hover:underline hover:underline-offset-4">{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
