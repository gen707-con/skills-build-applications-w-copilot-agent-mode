import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidObjectId(value: unknown) {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

function getSuggestedReason(goal: string, activityType: string | null) {
  const focus = activityType ? `${goal} and recent ${activityType} activity` : goal;
  return `Matches your ${focus} goal.`;
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  const payload = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const userId = normalizeString(payload.userId);
  const teamId = normalizeString(payload.teamId);
  const type = normalizeString(payload.type);
  const minutesValue = Number(payload.minutes);

  if (!userId || !teamId || !type || !Number.isFinite(minutesValue) || minutesValue <= 0) {
    throw new HttpError(400, 'Activity requires userId, teamId, type, and positive minutes.');
  }

  if (!isValidObjectId(userId) || !isValidObjectId(teamId)) {
    throw new HttpError(400, 'Activity userId and teamId must be valid Mongo ObjectIds.');
  }

  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) {
    throw new HttpError(400, 'Activity userId and teamId must reference existing records.');
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes: minutesValue,
    points: minutesValue,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean();
}

export async function createTeam(input: unknown) {
  const payload = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const name = normalizeString(payload.name);
  const mascot = normalizeString(payload.mascot);
  const membersInput = Array.isArray(payload.members) ? payload.members : [];

  if (!name) {
    throw new HttpError(400, 'Team name is required.');
  }

  if (!mascot) {
    throw new HttpError(400, 'Team mascot is required.');
  }

  const members = membersInput.map((member) => {
    if (typeof member !== 'string' || !isValidObjectId(member)) {
      throw new HttpError(400, 'Team members must be valid user IDs.');
    }
    return member;
  });

  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    {
      $project: {
        _id: 0,
        teamName: '$team.name',
        totalPoints: 1,
      },
    },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = normalizeString(userEmail).toLowerCase();
  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw new HttpError(404, 'No matching user found for workout suggestions.');
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();
  const activityType = recentActivities[0]?.type ?? null;

  const focusCandidates = [user.fitnessGoal, activityType].filter(Boolean) as string[];
  const workouts = await Workout.find({
    focus: { $in: focusCandidates.length ? focusCandidates : ['endurance', 'strength', 'mobility'] },
  }).sort({ minutes: -1 }).lean();

  if (workouts.length === 0) {
    return Workout.find().limit(3).lean().then((items) => items.map((item) => ({
      ...item,
      reason: `Matches your ${user.fitnessGoal || 'fitness'} goal.`,
    })));
  }

  return workouts.slice(0, 3).map((workout) => ({
    ...workout,
    reason: `Matches your ${user.fitnessGoal} goal${activityType ? ` and recent ${activityType} activity` : ''}.`,
  }));
}

export { User };
