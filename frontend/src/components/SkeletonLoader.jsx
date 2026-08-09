export default function SkeletonLoader() {
  return (
    <div className="card">
      <div className="skeleton-row">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton-row">
        <div className="skeleton skeleton-line" style={{ height: 38, flex: 1 }} />
        <div className="skeleton skeleton-line" style={{ height: 38, flex: 1 }} />
      </div>
      <div className="skeleton skeleton-line" style={{ height: 38, marginBottom: 20 }} />
      <div className="skeleton skeleton-line short" style={{ marginBottom: 20 }} />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}