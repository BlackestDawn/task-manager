import { justDate } from '@task-manager/common';
import type { Metadata } from 'next';
// import Styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Task Manager - Welcome',
  description: 'Task manager homepage',
};

export default async function Page() {
  return (
    <div>
      <h1>Hello, Next.js!</h1>
      <p>It works, today is {justDate(new Date())}</p>
    </div>
  );
}
