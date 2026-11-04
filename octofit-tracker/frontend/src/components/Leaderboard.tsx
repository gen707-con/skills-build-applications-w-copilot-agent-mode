import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    responseKey="leaderboard"
    emptyMessage="No leaderboard rankings yet."
    renderItem={(entry) => `#${String(entry.rank)} ${String(entry.teamName)} · ${String(entry.totalPoints)} points`}
  />;
}
