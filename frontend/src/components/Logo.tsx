import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 group">
      <img
        src="/tripmate-logo.svg"
        alt="TripMate"
        className="h-8 w-8 object-contain"
      />
      <span
        className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-white/80 transition-colors"
        style={{ fontFamily: "var(--font-display)" }}
      >
        TripMate{" "}
      </span>
    </Link>
  );
}
