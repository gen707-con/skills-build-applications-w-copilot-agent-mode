import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: [true, 'User name is required'], trim: true },
  email: { type: String, required: [true, 'User email is required'], trim: true, lowercase: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: { type: String, required: [true, 'User fitness goal is required'], trim: true },
});

export const User = model('User', userSchema);
