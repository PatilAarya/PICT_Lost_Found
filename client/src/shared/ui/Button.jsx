// Button component with its style variants.
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
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      {!loading && icon ? <Icon name={icon} size={20} /> : null}
      <span>{loading ? 'Please wait' : children}</span>
    </button>
  );
}
