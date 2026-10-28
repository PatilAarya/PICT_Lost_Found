// College logo next to the app name.
import { useState } from 'react';

const LOGO_URL = '/brand/pict-logo.png';

export function BrandMark({ size = 40, light = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageFailed) {
    return (
      <img
        className="brand-logo"
        src={LOGO_URL}
        alt="PICT logo"
        width={size}
        height={size}
        onError={() => setImageFailed(true)}
      />
    );
  }
  return (
    <span
      className={light ? 'brand-badge brand-badge-light' : 'brand-badge'}
      style={{ width: size, height: size }}
      aria-label="PICT"
      role="img"
    >
      PICT
    </span>
  );
}
