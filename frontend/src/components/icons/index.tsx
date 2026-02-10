import {
  LayoutGrid,
  User,
  FileText,
  Package,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";

const iconSize = 20;

export const IconCatalog = () => <LayoutGrid size={iconSize} />;
export const IconProfile = () => <User size={iconSize} />;
export const IconRequests = () => <FileText size={iconSize} />;
export const IconOffers = () => <Package size={iconSize} />;
export const IconLogout = () => <LogOut size={iconSize} />;
export const IconMenu = () => <Menu size={iconSize} />;
export const IconClose = () => <X size={iconSize} />;
export const IconBell = () => <Bell size={iconSize} />;
export const IconSearch = () => <Search size={18} />;
