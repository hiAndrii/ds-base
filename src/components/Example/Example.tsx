import type { ReactNode } from 'react';
import styles from './Example.module.css';

export interface ExampleProps {
  /** Content rendered inside the token-bound box. */
  children?: ReactNode;
}

/**
 * Example — the reference component for the `src/components/<Name>/` convention.
 *
 * It is a real, working component (not a placeholder): its single element is
 * styled entirely from semantic tokens via a CSS Module, proving the token
 * wiring end to end. Copy this folder's shape (`<Name>.tsx`,
 * `<Name>.module.css`, `index.ts`) for every new component.
 */
export function Example({ children }: ExampleProps) {
  return <div className={styles.box}>{children ?? 'Example'}</div>;
}
