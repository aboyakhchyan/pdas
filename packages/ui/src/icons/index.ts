export { Icon } from './icon';
export type { IconProps } from './icon';
export type { IconSvgElement } from '@hugeicons/react';

/**
 * Curated re-export of Hugeicons (free, "Stroke Rounded" set — https://hugeicons.com).
 *
 * Never import "@hugeicons/core-free-icons" directly from apps — go through this file so every
 * icon used in the product is listed in one place and named consistently. To add one: find its
 * exact export name in node_modules/@hugeicons/core-free-icons/dist/types/index.d.ts, re-export
 * it below (renamed to a generic name if the original is awkward), keep the list alphabetical.
 */
export {
    ArrowLeft01Icon as ArrowLeftIcon,
    ArrowRight01Icon as ArrowRightIcon,
    Briefcase01Icon as BriefcaseIcon,
    Calendar01Icon as CalendarIcon,
    Camera01Icon as CameraIcon,
    Cancel01Icon as CloseIcon,
    ChatIcon,
    Clock01Icon as ClockIcon,
    Delete01Icon as DeleteIcon,
    DollarCircleIcon,
    Download01Icon as DownloadIcon,
    Edit01Icon as EditIcon,
    FavouriteIcon as HeartIcon,
    File01Icon as FileIcon,
    FilterIcon,
    Home01Icon as HomeIcon,
    Image01Icon as ImageIcon,
    Location01Icon as LocationIcon,
    LockIcon,
    Logout01Icon as LogoutIcon,
    Mail01Icon as MailIcon,
    Menu01Icon as MenuIcon,
    Message01Icon as MessageIcon,
    MinusSignIcon,
    Notification01Icon as NotificationIcon,
    PlusSignIcon,
    Search01Icon as SearchIcon,
    Settings01Icon as SettingsIcon,
    Share01Icon as ShareIcon,
    StarIcon,
    Tick01Icon as CheckIcon,
    Upload01Icon as UploadIcon,
    UserIcon,
    ViewIcon as EyeIcon,
    ViewOffIcon as EyeOffIcon,
} from '@hugeicons/core-free-icons';
