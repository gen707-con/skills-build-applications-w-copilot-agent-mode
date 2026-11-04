import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadLeaderboard = () => getJson<Record<string, unknown>>('/api/leaderboard');

export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    loadData={loadLeaderboard}
    responseKey="leaderboard"
    emptyMessage="No leaderboard rankings yet."
    renderItem={(entry) => `#${String(entry.rank)} ${String(entry.teamName)} · ${String(entry.totalPoints)} points`}
  />;
}
