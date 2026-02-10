import { IconSearch } from "./icons";

export function SearchBar() {
  return (
    <div className="search-bar">
      <IconSearch />
      <input
        type="search"
        placeholder="Search"
        className="search-input"
        aria-label="Search"
      />
    </div>
  );
}
