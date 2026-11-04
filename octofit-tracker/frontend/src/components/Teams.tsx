import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    responseKey="teams"
    emptyMessage="No teams yet."
    renderItem={(team) => `${String(team.name)} · ${String(team.mascot ?? 'No mascot')} · ${Array.isArray(team.members) ? team.members.length : 0} members`}
  />;
}
