type AuthDividerProps = {
  label: string
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 text-text-heading">
      <span className="h-px flex-1 bg-text-heading opacity-25" />
      <p className="m-0 text-label-14 leading-5 opacity-50">{label}</p>
      <span className="h-px flex-1 bg-text-heading opacity-25" />
    </div>
  )
}
