import { justDate } from '@task-manager/common';
// import Styles from './page.module.css';

export default function Page() {
  return (
    <div>
      <h1>Hello, Next.js!</h1>
      <p>It works, today is {justDate(new Date())}</p>
    </div>
  );
}
