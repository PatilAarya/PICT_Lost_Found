// Small interface icons: Icon { name, size }. Only the 16 names in the contract
// are allowed, all from Phosphor in the thin weight (DESIGN.md section 8).
// Icons are decorative (aria-hidden), so always put a text label next to them.
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  Check,
  Clock,
  Funnel,
  Lock,
  MagnifyingGlass,
  MapPin,
  Plus,
  Shield,
  Trash,
  UploadSimple,
  User,
  X,
} from '@phosphor-icons/react';

const ICONS = {
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  close: X,
  camera: Camera,
  search: MagnifyingGlass,
  bell: Bell,
  check: Check,
  lock: Lock,
  clock: Clock,
  pin: MapPin,
  upload: UploadSimple,
  trash: Trash,
  plus: Plus,
  filter: Funnel,
  user: User,
  shield: Shield,
};

export function Icon({ name, size = 24 }) {
  const PhosphorIcon = ICONS[name];
  if (!PhosphorIcon) {
    return null;
  }
  return <PhosphorIcon size={size} weight="thin" aria-hidden="true" />;
}
