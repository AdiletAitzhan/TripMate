import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="logo">
      <img src="/tripmate-logo.svg" alt="" className="logo-mark" aria-hidden />
      <span className="logo-word">TripMate</span>
    </Link>
  )
}
