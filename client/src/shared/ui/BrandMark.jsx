// The college logo next to the app name, used in the top bar and on the login page.
// It shows /brand/pict-logo.png if that file exists in client/public/brand/. If the
// image cannot load (file missing), onError switches to a drawn "PICT" badge instead,
// so the page never shows a broken-image icon.
import { useState } from 'react';

const LOGO_URL = '/brand/pict-logo.png';

// BrandMark { size, light }: light = white badge for dark backgrounds.
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
