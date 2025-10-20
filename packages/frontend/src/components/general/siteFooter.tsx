import Link from "next/link";

export default function SiteFooter() {
  const currentYear = new Date().getUTCFullYear();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
          <p>© {currentYear} Alexander Stauch. All rights reserved.</p>
          <p className="mt-1 text-xs">
            Licensed under{' '}
            <Link
              href="/licensing"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Creative commons Attribution 4.0 International
            </Link>
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <Link
            href="/cookie-policy"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cookie Policy
          </Link>
          <Link
            href="/licensing"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Licensing
          </Link>
        </div>
      </div>
    </div>
  );
}
