import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// @testing-library/react's auto-cleanup relies on Jest-style global
// `afterEach` being present. This project imports test APIs explicitly
// (no `test.globals: true`), so without this, DOM from one test leaks
// into the next — e.g. asserting an element is absent can pass or fail
// based on what a *previous* test rendered, not the current one.
afterEach(() => {
  cleanup();
});
