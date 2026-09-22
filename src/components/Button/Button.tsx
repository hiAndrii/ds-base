import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonHierarchy = 'primary' | 'secondary' | 'outline' | 'ghost';

export type ButtonTone = 'neutral' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonOwnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

/**
 * Hierarchy and tone are independent everywhere except Secondary, which ships
 * Neutral only: a danger Secondary would render identically to a hovered danger
 * Ghost (ATOMS §Button). The union makes that pair a type error rather than a
 * silently unstyled button.
 */
type HierarchyAndTone =
  | { hierarchy?: 'primary' | 'outline' | 'ghost'; tone?: ButtonTone }
  | { hierarchy: 'secondary'; tone?: 'neutral' };

export type ButtonProps = ButtonOwnProps & HierarchyAndTone;

/** The seven pairs that exist. Keys mirror the ATOMS §Button palette rows. */
const pairClass = {
  'primary-neutral': styles.primaryNeutral,
  'primary-danger': styles.primaryDanger,
  'secondary-neutral': styles.secondaryNeutral,
  'outline-neutral': styles.outlineNeutral,
  'outline-danger': styles.outlineDanger,
  'ghost-neutral': styles.ghostNeutral,
  'ghost-danger': styles.ghostDanger,
} as const;

type ButtonPair = keyof typeof pairClass;

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
 * Hierarchy × Tone × State table in docs/ATOMS.md §Button. Figma's focus-ring
 * renderer workarounds (the `bg/surface` fill on Outline/Ghost Focus,
 * `clipsContent`) are deliberately not reproduced — `box-shadow` paints outside
 * the box with no fill — and neither is the shadow Active used to carry.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    // The props type is a union, so it is narrowed to its widest member here.
    // TypeScript has already rejected secondary + danger at the call site.
    const {
      hierarchy = 'primary',
      tone = 'neutral',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      type = 'button',
      className,
      children,
      ...rest
    } = props as ButtonOwnProps & {
      hierarchy?: ButtonHierarchy;
      tone?: ButtonTone;
    };

    // A JavaScript caller can still reach secondary + danger. Keep the tone —
    // a destructive action must not quietly lose its colour — and fall back to
    // the solid danger button, which is what picking Tone=Danger on Secondary
    // resolves to in Figma as well.
    const pair = `${hierarchy}-${tone}` as ButtonPair;
    const paletteClass = pairClass[pair] ?? pairClass['primary-danger'];

    const classes = [
      styles.button,
      paletteClass,
      // The focus ring follows tone, never hierarchy (ATOMS §Button).
      tone === 'danger' && styles.toneDanger,
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
