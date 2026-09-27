import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function NavHomeIcon({ size = 20, color = '#9B8D93', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function NavEarningsIcon({ size = 20, color = '#9B8D93', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Path d="M4 20V10M11 20V4M18 20v-7" strokeLinecap="round" />
    </Svg>
  );
}

export function NavHistoryIcon({ size = 20, color = '#9B8D93', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={13} r={8} />
      <Path d="M12 9v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 2h6" strokeLinecap="round" />
    </Svg>
  );
}

export function NavProfileIcon({ size = 20, color = '#9B8D93', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={8.2} r={3.2} />
      <Path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
    </Svg>
  );
}

export function NavigateIcon({ size = 15, color = '#6423C9', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Path d="M3 11l18-8-8 18-2-8-8-2z" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 22, color = '#2F7D4F', strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function OfflineIcon({ size = 24, color = '#9B8D93', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
    </Svg>
  );
}

export function BackIcon({ size = 16, color = '#251C21', strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PinIcon({ size = 16, color = '#251C21', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Rect x={5} y={4} width={14} height={16} rx={2} opacity={0} />
      <Circle cx={12} cy={11} r={3} />
      <Path d="M12 21c-4-4.5-7-8-7-11a7 7 0 0114 0c0 3-3 6.5-7 11z" strokeLinejoin="round" />
    </Svg>
  );
}
