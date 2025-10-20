import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Task manager",
  description: "Cookie Policy for Taskmanage application",
}

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Cookie Policy
      </h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">
          Last updated: 20 October 2025
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            What Are Cookies
          </h2>
          <p>
            Cookies are small text files that are stored on your device when you visit our website.
            They help us provide you with a better experience by remembering your preferences and
            understanding how you use our application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            How We Use Cookies
          </h2>
          <p>
            Task Manager uses cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <strong>Authentication:</strong> To keep you logged in and maintain your session securely.
            </li>
            <li>
              <strong>Preferences:</strong> To remember your settings and preferences, such as theme selection.
            </li>
            <li>
              <strong>Security:</strong> To protect against unauthorized access and ensure secure communication.
            </li>
            <li>
              <strong>Performance:</strong> To understand how you interact with our application and improve functionality.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Types of Cookies We Use
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
            Essential Cookies
          </h3>
          <p>
            These cookies are necessary for the application to function properly. They enable core
            functionality such as security, authentication, and session management. The application
            cannot function properly without these cookies.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
            Preference Cookies
          </h3>
          <p>
            These cookies allow the application to remember choices you make and provide enhanced,
            personalized features. For example, these cookies can be used to remember your theme
            preferences (light or dark mode).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Managing Cookies
          </h2>
          <p>
            You can control and manage cookies in your browser settings. Please note that removing
            or blocking cookies may impact your user experience and some features of the application
            may not function properly.
          </p>
          <p className="mt-4">
            Most browsers allow you to:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>View what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Block all cookies from being set</li>
            <li>Delete all cookies when you close your browser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Changes to This Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for other operational, legal, or regulatory reasons. Please review this page
            periodically for any updates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Contact Us
          </h2>
          <p>
            If you have any questions about our Cookie Policy, please contact us through the
            application support channels.
          </p>
        </section>
      </div>
    </div>
  );
}