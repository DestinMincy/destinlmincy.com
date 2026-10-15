export default function MilestonesLoading() {
  return (
    <div className="container section section--tight admin-screen">
      <div
        aria-busy="true"
        aria-label="Loading milestones"
        style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}
      >
        Loading...
      </div>
    </div>
  );
}
