import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar} role="navigation" aria-label="Ana navigasyon">
      <div className={styles.brand}>Turkcell AI</div>
      <ul className={styles.navList}>
        <li><a href="/" className={styles.navLink}>Ana Sayfa</a></li>
        <li><a href="/urunler" className={styles.navLink}>Ürünler</a></li>
        <li><a href="/iletisim" className={styles.navLink}>İletişim</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
