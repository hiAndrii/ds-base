import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. Maps to the Variant axis in Figma. */
  variant?: ButtonVariant;
  /** Control height and type scale. Maps to the Size axis in Figma. */
  size?: ButtonSize;
  /**
   * Busy state. Renders the structural spinner in place of the left icon,
   * blocks interaction (`disabled`) and announces itself with `aria-busy`.
   * The label stays readable — this is temporarily inactive, not unavailable.
   */
  loading?: boolean;
  /** Optional leading icon. Any node; suppressed while `loading`. */
  iconLeft?: ReactNode;
  /** Optional trailing icon. Any node. */
  iconRight?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  destructive: styles.destructive,
};

const sizeClass: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Button — the primary mechanism for user-initiated actions.
 *
 * The Figma `State` axis is not part of this API: Hover / Active / Focus are the
 * browser's `:hover` / `:active` / `:focus-visible`, Default is the absence of a
 * state, and only Disabled and Loading are props. Colour comes from the
 * Variant × State table in docs/ATOMS.md §Button. Figma's focus-ring renderer
 * workarounds (the `bg/surface` fill on Outline/Ghost Focus, `clipsContent`) are
 * deliberately not reproduced — `box-shadow` paints outside the box with no fill.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      type = 'button',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [
      styles.button,
      variantClass[variant],
      sizeClass[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          iconLeft != null && (
            <span className={styles.icon} aria-hidden="true">
              {iconLeft}
            </span>
          )
        )}
        {children != null && <span className={styles.label}>{children}</span>}
        {iconRight != null && (
          <span className={styles.icon} aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  },
);
