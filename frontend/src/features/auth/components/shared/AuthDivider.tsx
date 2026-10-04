type AuthDividerProps = {
  label: string
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div
      aria-hidden="true"
      className="text-text-heading flex items-center gap-4"
    >
      <span className="bg-text-heading h-px flex-1 opacity-25" />
      <p className="text-label-14 m-0 leading-5 opacity-50">{label}</p>
      <span className="bg-text-heading h-px flex-1 opacity-25" />
    </div>
  )
}
