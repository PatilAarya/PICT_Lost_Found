// Button { variant, size, icon, loading } (DESIGN.md section 9).
// primary = red fill (the main action), secondary = steel fill, quiet = outline only,
// danger = red like primary; the page that uses it must add a confirm step first.
// While loading, the button is disabled and shows a small spinner and "Please wait".
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
