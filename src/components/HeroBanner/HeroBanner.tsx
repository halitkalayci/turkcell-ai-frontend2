import { useState } from "react";
import styles from "./HeroBanner.module.css";

const BRAND_NAMES = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
  </svg>
);

const HeroBanner = () => {
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  const hideAnnouncement = () => setIsAnnouncementVisible(false);

  return (
    <section aria-label="Hero Banner">
      {isAnnouncementVisible && (
        <div className={styles.announcementBar}>
          <p className={styles.announcementText}>
            Sign up and get 20% off to your first order.{" "}
            <a href="#" className={styles.announcementLink}>
              Sign Up Now
            </a>
          </p>
          <button
            className={styles.announcementClose}
            onClick={hideAnnouncement}
            aria-label="Duyuruyu kapat"
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Find Clothes That Matches Your Style
            </h1>
            <p className={styles.heroDescription}>
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense of
              style.
            </p>
            <a href="#products" className={styles.heroButton}>
              Shop Now
            </a>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>200+</span>
                <span className={styles.statLabel}>International Brands</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>2,000+</span>
                <span className={styles.statLabel}>High-Quality Products</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>30,000+</span>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <span className={styles.sparkleLarge} aria-hidden="true">
              <SparkleIcon />
            </span>
            <span className={styles.sparkleSmall} aria-hidden="true">
              <SparkleIcon />
            </span>
            <img
              src="https://placehold.co/480x560/e8e8e8/374151?text=Model"
              alt="Style model"
              className={styles.heroImage}
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div className={styles.brandStrip}>
        <ul className={styles.brandList} aria-label="Desteklenen markalar">
          {BRAND_NAMES.map((brand) => (
            <li key={brand} className={styles.brandName}>
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroBanner;
