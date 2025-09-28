import { justDate } from '@task-manager/common';
import type { Metadata } from 'next';
// import Styles from './page.module.css';
import PublicRoute from '@/components/auth/publicRoute';

export const metadata: Metadata = {
  title: 'Task Manager - Welcome',
  description: 'Task manager homepage',
};

export default function Page() {
  return (
    <PublicRoute redirectTo='/dashboard'>
      <div>
        <h1>Hello, Next.js!</h1>
        <p>It works, today is {justDate(new Date())}</p>
      </div>
    </PublicRoute>
  );
}
