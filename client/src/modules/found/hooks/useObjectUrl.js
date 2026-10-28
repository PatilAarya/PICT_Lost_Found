// Turns a Blob (a photo in memory) into a temporary URL an <img> can show.
// URL.createObjectURL keeps the blob in memory until revokeObjectURL is called, so the
// cleanup function frees it when the blob changes or the page closes.
import { useEffect, useState } from 'react';

export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}
