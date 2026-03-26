import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { selectUniqueCartItemCount } from "../../store/slices/cartSlice";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const cartItemCount = useAppSelector(selectUniqueCartItemCount);
  const hasItems = cartItemCount > 0;

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Ana navigasyon">
      <Link to="/" className={styles.brand}>Turkcell AI</Link>
      <ul className={styles.navList}>
        <li><Link to="/" className={styles.navLink}>Ana Sayfa</Link></li>
        <li><Link to="/urunler" className={styles.navLink}>Ürünler</Link></li>
        <li><Link to="/hakkimizda" className={styles.navLink}>Hakkımızda</Link></li>
        <li>
          <Link to="/sepet" className={styles.navLink}>
            Sepet
            {hasItems && (
              <span className={styles.cartBadge} aria-label={`${cartItemCount} ürün`}>
                {cartItemCount}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
