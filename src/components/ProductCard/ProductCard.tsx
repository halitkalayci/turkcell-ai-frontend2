import { useAppDispatch } from "../../store/hooks";
import { addItem } from "../../store/slices/cartSlice";
import type { Product } from "../../types/product";
import styles from "./ProductCard.module.css";

const MAX_STARS = 5;

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  });
};

const renderStars = (rating: number): string => {
  const fullStars = Math.round(rating);
  const emptyStars = MAX_STARS - fullStars;
  return "★".repeat(fullStars) + "☆".repeat(emptyStars);
};

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addItem({ id: product.id, name: product.name, price: product.price }));
  };

  return (
    <article className={styles.card}>
      <span className={styles.productId}>id: {product.id}</span>

      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
        />
        <div className={styles.actionIcons}>
          <button type="button" className={styles.iconButton} aria-label="Karşılaştır">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button type="button" className={styles.iconButton} aria-label="Favorilere ekle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.ratingRow}>
          <span className={styles.stars}>{renderStars(product.rating)}</span>
          <span className={styles.reviewCount}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {product.reviewCount}
          </span>
        </div>
      </div>

      <div className={styles.priceRow}>
        <div className={styles.priceInfo}>
          <div className={styles.originalPriceRow}>
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            <span className={styles.discountBadge}>-{product.discountPercentage}%</span>
          </div>
          <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddToCart}
          aria-label="Sepete ekle"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
