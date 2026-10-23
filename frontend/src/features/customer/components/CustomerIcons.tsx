import type { SVGProps } from 'react'

type CustomerIconProps = SVGProps<SVGSVGElement>

export function NotificationIcon(props: CustomerIconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>
}

export function ChevronDownIcon(props: CustomerIconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
}

export function MenuIcon(props: CustomerIconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>
}

export function CustomerAvatarIcon(props: CustomerIconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 32 32" {...props}><circle cx="16" cy="16" r="15" fill="currentColor" /><path d="M16 16a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6ZM7.5 25c.7-3.7 4.1-6.2 8.5-6.2s7.8 2.5 8.5 6.2" stroke="white" strokeLinecap="round" strokeWidth="1.8" /></svg>
}
