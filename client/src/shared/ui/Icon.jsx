// Small interface icons: Icon { name, size }. Only the names below are allowed, all
// from Phosphor (DESIGN.md section 8). The first 16 are the contract's control icons;
// the rest were added for the menu, the user menu and status cards.
// We use the "light" weight: thin was too faint to read at 20px on the menu.
// Icons are decorative (aria-hidden), so always put a text label next to them.
import {
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Bell,
  Camera,
  CaretDown,
  ChartBar,
  Check,
  CheckCircle,
  Clock,
  Flag,
  Funnel,
  House,
  Info,
  Lock,
  MagnifyingGlass,
  MapPin,
  Package,
  Plus,
  Shield,
  ShieldCheck,
  SignOut,
  Ticket,
  Trash,
  Tray,
  UploadSimple,
  User,
  Warning,
  X,
} from '@phosphor-icons/react';

const ICONS = {
  // Contract control icons
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
  // Menu, user menu and status icons
  home: House,
  package: Package,
  ticket: Ticket,
  inbox: Tray,
  chart: ChartBar,
  flag: Flag,
  'shield-check': ShieldCheck,
  'sign-out': SignOut,
  'caret-down': CaretDown,
  info: Info,
  warning: Warning,
  refresh: ArrowsClockwise,
  'check-circle': CheckCircle,
};

export function Icon({ name, size = 24 }) {
  const PhosphorIcon = ICONS[name];
  if (!PhosphorIcon) {
    return null;
  }
  return <PhosphorIcon size={size} weight="light" aria-hidden="true" />;
}
