import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function SearchIcon(props: IconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}><circle cx="10.8" cy="10.8" r="7.3" stroke="currentColor" strokeWidth="1.7"/><path d="m16.2 16.2 4.3 4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7"/></svg>
}

export function SortIcon(props: IconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}><path d="M4 7h16M7 12h13m-9 5h9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7"/><path d="m4 10 3-3 3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
}

export function SearchBathIcon(props: IconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Zm2 7-1 2m14-2 1 2M5 12V6a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
}
