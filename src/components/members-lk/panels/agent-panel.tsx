import styles from "./panel.module.css";

export function LkAgentPanel() {
  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <h2 className={styles.h2}>Агент</h2>
        <p className={styles.body}>
          Заявка «Стать агентом» и статус рассмотрения будут здесь. В legacy это
          таблица «Агенты» в Airtable / Make formname=agent — перенос без догадок
          по полям.
        </p>
        <p className={styles.muted}>Раздел в работе (M2-LK follow-up).</p>
      </section>
    </div>
  );
}
