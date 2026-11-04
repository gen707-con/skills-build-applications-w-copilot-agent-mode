import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint="/api/workouts/suggestions/mona%40example.com"
    responseKey="suggestions"
    emptyMessage="No workout suggestions available."
    renderItem={(workout) => `${String(workout.title)} · ${String(workout.focus ?? 'general')} · ${String(workout.minutes)} minutes · ${String(workout.reason ?? '')}`}
  />;
}
