export default function ContractsLoading() {
  return (
    <div className="container section section--tight admin-screen">
      <div
        aria-busy="true"
        aria-label="Loading contracts"
        style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}
      >
        Loading...
      </div>
    </div>
  );
}
