import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadTeams = () => getJson<Record<string, unknown>>('/api/teams');

export default function Teams() {
  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    loadData={loadTeams}
    responseKey="teams"
    emptyMessage="No teams yet."
    renderItem={(team) => `${String(team.name)} · ${String(team.mascot ?? 'No mascot')} · ${Array.isArray(team.members) ? team.members.length : 0} members`}
  />;
}
