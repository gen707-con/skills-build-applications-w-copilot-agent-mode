import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadWorkouts = () => getJson<Record<string, unknown>>('/api/workouts/suggestions/mona%40example.com');

export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadData={loadWorkouts}
    responseKey="suggestions"
    emptyMessage="No workout suggestions available."
    renderItem={(workout) => `${String(workout.title)} · ${String(workout.focus ?? 'general')} · ${String(workout.minutes)} minutes · ${String(workout.reason ?? '')}`}
  />;
}
