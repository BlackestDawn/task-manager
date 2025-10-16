'use client';
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AlertCircle, X } from "lucide-react";

export default function RedirectNotification() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [redirectedFrom, setRedirectedFrom] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fromPath = searchParams.get("redirect");
    const wasRedirected = !!fromPath;

    if (wasRedirected) {
      setRedirectedFrom(fromPath);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, mounted]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const getPageName = (path: string | null): string => {
    if (!path || typeof path !== "string") return "Restricted page";

    try {
      const cleanPath = path.split("?")[0] || '';
      const segments = cleanPath.split("/").filter(s => s.length > 0);

      if (segments.length === 0) return "homepage";
      const lastSegment = segments[segments.length -1];

      if (!lastSegment || lastSegment === '') return 'homepage';
      return lastSegment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch (error) {
      console.warn("Failed to parse page name from path:", path, "Error:", error);
      return "restricted page";
    }
  };

  if (!mounted || !isVisible) return null;

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>
                  You were redirected to login because the page you tried to access requires authentication.
                </p>
                {redirectedFrom && (
                  <p className="font-medium">
                    Attempted to access: <span className="text-indigo-600 dark:text-indigo-400">{getPageName(redirectedFrom)}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This message will disappear automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-indigo-600 h-1 rounded-full transition-all duration-[5000ms] ease-linear"
              style={{ width: '0%', animation: 'progress 5s linear forwards' }}
            />
          </div>
        </div>
      </div>

      {/* Add keyframe animation */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-top-4 {
          from { transform: translate(-50%, -60%); }
          to { transform: translate(-50%, -50%); }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out, slide-in-from-top-4 0.3s ease-out;
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}