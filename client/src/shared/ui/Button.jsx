// STUB button with the contract props: { variant, size, icon, loading }.
// variant is primary | secondary | quiet | danger; size is md | lg.
// Member 1 restyles it; the props must stay the same.
import { Icon } from './Icon.jsx';

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}`}
      disabled={loading || rest.disabled}
      aria-busy={loading}
      {...rest}
    >
      {icon ? <Icon name={icon} size={20} /> : null}
      <span>{loading ? 'Please wait' : children}</span>
    </button>
  );
}
