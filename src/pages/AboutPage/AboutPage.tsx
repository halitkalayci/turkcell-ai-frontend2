import styles from "./AboutPage.module.css";

const AboutPage = () => {
  return (
    <main className={styles.page}>
      <article className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Hakkımızda</h1>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Biz Kimiz?</h2>
          <p className={styles.text}>
            Modern e-ticaret deneyimini sizlere sunmak için yola çıkan bir ekibiz.
            Kaliteli ürünler ve müşteri memnuniyeti odaklı hizmet anlayışımızla
            sektörde fark yaratmayı hedefliyoruz.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Misyonumuz</h2>
          <p className={styles.text}>
            Müşterilerimize en iyi alışveriş deneyimini sunmak, kaliteli ve güvenilir
            ürünleri en uygun fiyatlarla ulaştırmak ve her zaman yanlarında olmaktır.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vizyonumuz</h2>
          <p className={styles.text}>
            Türkiye'nin önde gelen e-ticaret platformlarından biri olmak ve
            müşterilerimizin her zaman ilk tercihi olmayı sürdürmektir.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>İletişim</h2>
          <address className={styles.contact}>
            <p className={styles.text}>Sorularınız için bizimle iletişime geçebilirsiniz:</p>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <strong>E-posta:</strong>{" "}
                <a href="mailto:info@example.com" className={styles.link}>
                  info@example.com
                </a>
              </li>
              <li className={styles.contactItem}>
                <strong>Telefon:</strong> +90 (212) 555 0000
              </li>
            </ul>
          </address>
        </section>
      </article>
    </main>
  );
};

export default AboutPage;
