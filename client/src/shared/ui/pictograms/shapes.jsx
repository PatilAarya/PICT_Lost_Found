// The SVG drawings for each item category.
function IdCard() {
  return (
    <>
      <rect className="pg-line" x="6" y="12" width="36" height="26" rx="3" />
      <rect className="pg-fill" x="11" y="18" width="10" height="13" rx="1" />
      <path className="pg-line" d="M26 20h11M26 26h9M26 32h5" />
      <rect className="pg-dot" x="20" y="8" width="8" height="3" rx="1.5" />
    </>
  );
}

function Phone() {
  return (
    <>
      <rect className="pg-line" x="14" y="5" width="20" height="38" rx="4" />
      <rect className="pg-fill" x="18" y="10" width="12" height="24" rx="1" />
      <path className="pg-line" d="M22 7.5h4" />
      <circle className="pg-dot" cx="24" cy="38.5" r="1.8" />
    </>
  );
}

function Laptop() {
  return (
    <>
      <rect className="pg-fill" x="10" y="10" width="28" height="20" rx="2" />
      <path className="pg-line" d="M4 34h40l-3 5H7z" />
      <circle className="pg-dot" cx="24" cy="13.5" r="1.3" />
    </>
  );
}

function Wallet() {
  return (
    <>
      <path className="pg-line" d="M12 13V9h20v4" />
      <rect className="pg-line" x="6" y="13" width="36" height="25" rx="3" />
      <rect className="pg-fill" x="28" y="20" width="14" height="11" rx="2" />
      <circle className="pg-dot" cx="34" cy="25.5" r="2" />
    </>
  );
}

function Keys() {
  return (
    <>
      <circle className="pg-line" cx="14" cy="14" r="8" />
      <path className="pg-line" d="M20 20l5 5" />
      <circle className="pg-fill" cx="29" cy="29" r="6" />
      <path className="pg-line" d="M33.5 33.5L42 42M37 37l3-3M40 40l3-3" />
      <circle className="pg-dot" cx="29" cy="29" r="2" />
    </>
  );
}

function Bottle() {
  return (
    <>
      <rect className="pg-dot" x="19" y="4" width="10" height="5" rx="1" />
      <rect className="pg-fill" x="15" y="24" width="18" height="10" />
      <path className="pg-line" d="M20 9v4l-5 6v21a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V19l-5-6V9" />
    </>
  );
}

function Bag() {
  return (
    <>
      <path className="pg-line" d="M19 11a5 5 0 0 1 10 0" />
      <path
        className="pg-line"
        d="M11 22a11 11 0 0 1 11-11h4a11 11 0 0 1 11 11v17a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z"
      />
      <rect className="pg-fill" x="16" y="27" width="16" height="10" rx="2" />
      <rect className="pg-dot" x="22" y="25" width="4" height="4" rx="1" />
    </>
  );
}

function Earbuds() {
  return (
    <>
      <circle className="pg-fill" cx="16" cy="11" r="4" />
      <circle className="pg-fill" cx="32" cy="11" r="4" />
      <path className="pg-line" d="M16 15v4M32 15v4" />
      <rect className="pg-line" x="9" y="22" width="30" height="20" rx="8" />
      <path className="pg-line" d="M9 30h30" />
      <circle className="pg-dot" cx="24" cy="36" r="1.8" />
    </>
  );
}

function Books() {
  return (
    <>
      <rect className="pg-line" x="7" y="10" width="11" height="31" rx="1" />
      <rect className="pg-fill" x="18" y="15" width="10" height="26" rx="1" />
      <path className="pg-line" d="M29 17l6-2 6 24-6 2z" />
      <path className="pg-line" d="M4 41h40" />
      <path className="pg-dot" d="M10 10v8l2-2 2 2v-8z" />
    </>
  );
}

function Other() {
  return (
    <>
      <rect className="pg-fill" x="6" y="11" width="36" height="7" />
      <rect className="pg-line" x="9" y="18" width="30" height="23" rx="1" />
      <path className="pg-line" d="M19 25h10" />
      <rect className="pg-dot" x="22" y="11" width="4" height="7" />
    </>
  );
}

export const PICTOGRAM_SHAPES = {
  id_card: IdCard,
  phone: Phone,
  laptop: Laptop,
  wallet: Wallet,
  keys: Keys,
  bottle: Bottle,
  bag: Bag,
  earbuds: Earbuds,
  books: Books,
  other: Other,
};
