import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from './cn';
import { ArrowRightIcon } from './icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'approve' | 'reject';
export type ButtonSize = 'md' | 'sm';

const variantClass: Record<ButtonVariant, string> = {
  // Dark ink on accent, not white: #FFF on #1EA6C6 is only 2.86:1, well below AA.
  primary:
    'bg-accent text-bg shadow-(--shadow-glow-btn) hover:bg-accent-bright focus-visible:bg-accent-bright',
  secondary:
    'bg-surface/60 text-ink border border-line-strong hover:border-accent/70 hover:bg-surface',
  ghost: 'text-accent-bright hover:text-accent-ink px-0',
  approve: 'bg-go text-[#06210F] shadow-(--shadow-glow-go) hover:brightness-110',
  reject: 'border border-stop/70 text-stop hover:bg-stop-bg',
};

const sizeClass: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-[1.0625rem]',
  sm: 'h-10 px-4 text-sm',
};

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-(--radius-btn) font-sans font-semibold ' +
  'transition-[background-color,border-color,color,filter,box-shadow] duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-50';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Adds a trailing arrow — the default for the `ghost` variant. */
  withArrow?: boolean;
  leading?: ReactNode;
  className?: string;
  children: ReactNode;
}

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;
type NativeAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href'>;

export type ButtonProps = CommonProps &
  (
    | ({ href: string; ref?: Ref<HTMLAnchorElement> } & NativeAnchorProps)
    | ({ href?: undefined; ref?: Ref<HTMLButtonElement> } & NativeButtonProps)
  );

/**
 * The site's only button. Renders an `<a>` when `href` is given, otherwise a
 * `<button>`. External links open in a new tab with `rel="noopener"`.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  withArrow,
  leading,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    variantClass[variant],
    variant === 'ghost' ? 'h-auto py-1' : sizeClass[size],
    className,
  );

  const content = (
    <>
      {leading}
      <span>{children}</span>
      {(withArrow ?? variant === 'ghost') ? <ArrowRightIcon className="size-[1.1em]" /> : null}
    </>
  );

  if (typeof rest.href === 'string') {
    const { href, ...anchorProps } = rest as { href: string } & NativeAnchorProps;
    const isExternal = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const { href: _href, ...buttonProps } = rest as { href?: undefined } & NativeButtonProps;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
