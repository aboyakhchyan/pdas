import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react';

export type IconProps = HugeiconsIconProps;

export function Icon({
    size = 20,
    strokeWidth = 1.5,
    color = 'currentColor',
    ...props
}: IconProps) {
    return <HugeiconsIcon size={size} strokeWidth={strokeWidth} color={color} {...props} />;
}
