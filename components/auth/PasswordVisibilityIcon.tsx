export interface PasswordVisibilityIconProps {
  visible: boolean
}

export default function PasswordVisibilityIcon({ visible }: PasswordVisibilityIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {visible && <path d="m4 4 16 16" />}
    </svg>
  )
}
