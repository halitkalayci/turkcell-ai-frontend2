import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { selectUniqueCartItemCount } from "../../store/slices/cartSlice";
import styles from "./Navbar.module.css";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Navbar = () => {
  const cartItemCount = useAppSelector(selectUniqueCartItemCount);

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <Link to="/" className={styles.brand}>SHOP.CO</Link>

      <ul className={styles.navList}>
        <li>
          <Link to="/urunler" className={styles.navLink}>
            Shop <ChevronDownIcon />
          </Link>
        </li>
        <li><Link to="/urunler" className={styles.navLink}>On Sale</Link></li>
        <li><Link to="/" className={styles.navLink}>New Arrivals</Link></li>
        <li><Link to="/hakkimizda" className={styles.navLink}>Brands</Link></li>
      </ul>

      <div className={styles.searchBar}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Search for products..."
          className={styles.searchInput}
          aria-label="Search for products"
        />
      </div>

      <div className={styles.iconGroup}>
        <Link
          to="/sepet"
          className={styles.iconButton}
          aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
        >
          <CartIcon />
          {cartItemCount > 0 && (
            <span className={styles.cartBadge} aria-hidden="true">
              {cartItemCount}
            </span>
          )}
        </Link>

        <button type="button" className={styles.iconButton} aria-label="User account">
          <UserIcon />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
