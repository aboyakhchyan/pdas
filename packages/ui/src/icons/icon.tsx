import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";

export type IconProps = HugeiconsIconProps;

/**
 * Design-system default renderer for Hugeicons. Prefer this over importing `HugeiconsIcon`
 * directly so size/stroke defaults stay consistent everywhere — pass any icon exported from
 * this folder as `icon`.
 *
 *   import { Icon, SearchIcon } from "@hyework/ui/icons";
 *   <Icon icon={SearchIcon} />
 */
export function Icon({ size = 20, strokeWidth = 1.5, color = "currentColor", ...props }: IconProps) {
  return <HugeiconsIcon size={size} strokeWidth={strokeWidth} color={color} {...props} />;
}
