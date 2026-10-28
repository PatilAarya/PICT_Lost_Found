// Small interface icons used across the app.
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
