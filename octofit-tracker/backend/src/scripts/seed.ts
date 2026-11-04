import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Activity, Team, User, Workout } from '../models/index.js';

async function upsertDemoTeam(name: string, mascot: string) {
  return Team.findOneAndUpdate(
    { name },
    { $set: { name, mascot } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function upsertDemoUser(name: string, email: string, teamId: InstanceType<typeof Team>['_id'], fitnessGoal: string) {
  const previousUser = await User.findOne({ email }).select('_id team');
  if (previousUser?.team && previousUser.team.toString() !== teamId.toString()) {
    await Team.updateOne({ _id: previousUser.team }, { $pull: { members: previousUser._id } });
  }

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, email, team: teamId, fitnessGoal } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Team.updateOne({ _id: teamId }, { $addToSet: { members: user._id } });
  return user;
}

async function upsertDemoWorkout(title: string, focus: string, minutes: number, difficulty: string) {
  return Workout.findOneAndUpdate(
    { title },
    { $set: { title, focus, minutes, difficulty } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function seed() {
  await connectDatabase();
  try {
    const octocats = await upsertDemoTeam('Octocats', 'Mona');
    const robocats = await upsertDemoTeam('Robocats', 'Hubot');
    const speedsters = await upsertDemoTeam('Speedsters', 'Bolt');
    const dragons = await upsertDemoTeam('Dragons', 'Blaze');

    const mona = await upsertDemoUser('Mona', 'mona@example.com', octocats._id, 'endurance');
    const hubot = await upsertDemoUser('Hubot', 'hubot@example.com', robocats._id, 'strength');
    const ava = await upsertDemoUser('Ava', 'ava@example.com', speedsters._id, 'mobility');

    const monaRunAt = new Date('2026-01-10T12:00:00.000Z');
    const hubotCycleAt = new Date('2026-01-11T12:00:00.000Z');
    const avaWalkAt = new Date('2026-01-12T12:00:00.000Z');

    await Activity.updateOne(
      { user: mona._id, team: octocats._id, type: 'run', occurredAt: monaRunAt },
      { $set: { user: mona._id, team: octocats._id, type: 'run', minutes: 40, points: 40, occurredAt: monaRunAt } },
      { upsert: true },
    );
    await Activity.updateOne(
      { user: hubot._id, team: robocats._id, type: 'cycle', occurredAt: hubotCycleAt },
      { $set: { user: hubot._id, team: robocats._id, type: 'cycle', minutes: 25, points: 25, occurredAt: hubotCycleAt } },
      { upsert: true },
    );
    await Activity.updateOne(
      { user: ava._id, team: speedsters._id, type: 'walk', occurredAt: avaWalkAt },
      { $set: { user: ava._id, team: speedsters._id, type: 'walk', minutes: 30, points: 30, occurredAt: avaWalkAt } },
      { upsert: true },
    );

    await upsertDemoWorkout('Intervals', 'endurance', 30, 'moderate');
    await upsertDemoWorkout('Strength Circuit', 'strength', 30, 'moderate');
    await upsertDemoWorkout('Mobility Flow', 'mobility', 20, 'easy');

    await Team.updateOne({ _id: dragons._id }, { $set: { members: [] } });
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  await seed();
}
