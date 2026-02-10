import { Link } from "react-router-dom";
import { User } from "lucide-react";

interface UserAvatarProps {
  photoUrl?: string;
}

export function UserAvatar({ photoUrl }: UserAvatarProps) {
  return (
    <Link to="/profile" className="user-avatar" aria-label="Go to profile">
      {photoUrl ? (
        <img src={photoUrl} alt="Profile" className="user-avatar-image" />
      ) : (
        <User size={18} />
      )}
    </Link>
  );
}
