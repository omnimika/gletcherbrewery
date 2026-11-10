import styles from "./panel.module.css";

export function LkPlaceholderPanel({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <h2 className={styles.h2}>{title}</h2>
        <p className={styles.body}>{body}</p>
      </section>
    </div>
  );
}
