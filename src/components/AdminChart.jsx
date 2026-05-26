export default function AdminChart({ title, children }) {
  return (
    <section className="chart-card">
      <div className="chart-card__header">
        <h3>{title}</h3>
      </div>
      <div className="chart-card__body">{children}</div>
    </section>
  );
}
