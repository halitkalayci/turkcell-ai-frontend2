import type { Product } from "../../types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className={styles.card}>
      <span className={styles.id}>#{product.id}</span>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>{product.price.toLocaleString("tr-TR")} ₺</p>
    </article>
  );
};

export default ProductCard;
