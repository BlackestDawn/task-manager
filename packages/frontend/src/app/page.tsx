import React from "react";
import { CheckCircle2, Users, Shield, Database, Code2, Zap, Lock, GitBranch } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - Welcome',
  description: 'Task manager homepage',
};

export default async function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Task Manager
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mt-2">
              Enterprise-Grade System
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A full-stack collaborative task management platform showcasing modern web development practices,
            role-based access control, and enterprise architecture patterns. Built as a comprehensive milestone
            project demonstrating software engineering skills.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="bg-purple-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Users className="text-purple-400 w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Group Collaboration</h3>
            <p className="text-slate-300 leading-relaxed">
              Organize tasks within groups with fine-grained role management. Supports supervisor, editor, user,
              and viewer roles with distinct permissions for optimal team collaboration.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20">
            <div className="bg-pink-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-pink-400 w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Advanced Permissions</h3>
            <p className="text-slate-300 leading-relaxed">
              CASL-powered authorization system with context-aware permissions. Rules cascade across user levels,
              group memberships, and task ownership for secure, flexible access control.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
            <div className="bg-blue-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <CheckCircle2 className="text-blue-400 w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Task Management</h3>
            <p className="text-slate-300 leading-relaxed">
              Create, assign, and track tasks with deadlines and completion states. Permissions prevent -among other things- deletion
              of completed group-level tasks and ensure data integrity across team workflows.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Platform Capabilities
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start space-x-4 bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
              <Lock className="text-purple-400 w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">JWT Authentication</h4>
                <p className="text-slate-400">Secure token-based auth with refresh tokens, bcrypt password hashing, and session management</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
              <Users className="text-pink-400 w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Multi-Role System</h4>
                <p className="text-slate-400">Admin, manager, and user access levels with granular group-level role assignments</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
              <GitBranch className="text-blue-400 w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Groups</h4>
                <p className="text-slate-400">Organize users into groups with group-specific permissions and task assignments</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
              <Shield className="text-green-400 w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Field-Level Security</h4>
                <p className="text-slate-400">Protect sensitive fields like passwords and enforce business rules at the permission layer</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Technology Stack
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Code2 className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Frontend</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">Next.js</span> - React framework with SSR</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">TypeScript</span> - Type-safe development</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">Tailwind CSS</span> - Utility-first styling</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">CASL React</span> - Declarative permissions</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Zap className="text-purple-400 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Backend</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">Bun</span> - Ultra-fast JavaScript runtime</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">Hono</span> - Lightweight web framework</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">Drizzle ORM</span> - Type-safe SQL toolkit</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">PostgreSQL</span> - Relational database</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Database className="text-pink-400 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Common Layer</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">Zod</span> - Schema validation library</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">CASL</span> - Authorization framework</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-slate-300"><span className="font-semibold text-white">TypeScript</span> - Shared type definitions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Architecture Highlights
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-left">
              <h4 className="text-xl font-bold text-white mb-3">Monorepo Structure</h4>
              <p className="text-slate-300">
                Three-package architecture with clear separation of concerns: frontend, backend, and shared common layer
                for types and business logic
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 text-left">
              <h4 className="text-xl font-bold text-white mb-3">Type Safety</h4>
              <p className="text-slate-300">
                End-to-end TypeScript with Zod validation ensures runtime type checking and compile-time guarantees
                across the entire stack
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-blue-500/10 border border-pink-500/30 rounded-xl p-6 text-left">
              <h4 className="text-xl font-bold text-white mb-3">Permission Model</h4>
              <p className="text-slate-300">
                Centralized CASL ability definitions in the common package ensure consistent authorization logic
                between client and server
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6 text-left">
              <h4 className="text-xl font-bold text-white mb-3">Modern Runtime</h4>
              <p className="text-slate-300">
                Bun runtime provides exceptional performance with native TypeScript support, faster startup times,
                and built-in testing utilities
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center border-t border-slate-700 pt-12">
          <p className="text-slate-400 text-lg mb-4">
            This project demonstrates comprehensive full-stack development skills including:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              'API Design',
              'Database Modeling',
              'Authentication & Authorization',
              'State Management',
              'Type Systems',
              'Testing',
              'Security Best Practices',
              'Modern Tooling'
            ].map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Built with modern web technologies as a capstone project showcasing software engineering education
          </p>
        </div>
      </div>
    </div>
  );
}
