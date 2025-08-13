import type { ReactElement, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const Icons: Record<string, (props: IconProps) => ReactElement> = {
  logo: (props: IconProps) => (
    <svg viewBox="0 0 77 104" xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect fill="#FFFFFF" x="0" y="36" width="12" height="32" rx="6" ry="6" />
      <rect fill="#FFFFFF" x="16" y="18" width="12" height="68" rx="6" ry="6" />
      <rect fill="#FFFFFF" x="48" y="18" width="12" height="68" rx="6" ry="6" />
      <rect fill="#FFFFFF" x="32" y="0" width="12" height="42" rx="6" ry="6" />
      <rect fill="#FFFFFF" x="32" y="62" width="12" height="42" rx="6" ry="6" />
      <rect fill="#FFFFFF" x="65" y="35.84" width="12" height="32" rx="6" ry="6" transform="translate(142 103.67) rotate(-180)" />
      <circle fill="#FFFFFF" cx="38" cy="52" r="6" />
    </svg>
  ),
};

type IconType = keyof typeof Icons;

interface IconComponentProps extends IconProps {
  type: IconType;
}

export default function Icon({ type, ...props }: IconComponentProps) {
  const IconComponent = Icons[type];
  return IconComponent(props);
}