export function Logo({ className }: { className?: string }) {
  return (
    <span className={className ?? "text-h2 text-ink"}>
      <span className="text-primary">go</span>zem
    </span>
  );
}
