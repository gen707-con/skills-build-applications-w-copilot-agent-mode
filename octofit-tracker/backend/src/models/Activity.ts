import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Activity user is required'] },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: [true, 'Activity team is required'] },
  type: { type: String, required: [true, 'Activity type is required'], trim: true },
  minutes: { type: Number, required: [true, 'Activity minutes are required'], min: [1, 'Activity minutes must be greater than zero'] },
  points: { type: Number, required: [true, 'Activity points are required'], min: [0, 'Activity points cannot be negative'] },
  occurredAt: { type: Date, required: [true, 'Activity occurredAt is required'] },
});

export const Activity = model('Activity', activitySchema);
