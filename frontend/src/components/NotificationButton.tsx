import { IconBell } from "./icons";

export function NotificationButton() {
  return (
    <button
      type="button"
      className="icon-button"
      title="Notifications"
      aria-label="Notifications"
    >
      <IconBell />
    </button>
  );
}
