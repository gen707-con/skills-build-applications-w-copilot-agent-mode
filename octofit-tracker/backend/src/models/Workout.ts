import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: [true, 'Workout title is required'], trim: true },
  focus: { type: String, required: [true, 'Workout focus is required'], trim: true },
  minutes: { type: Number, required: [true, 'Workout minutes are required'], min: [1, 'Workout minutes must be greater than zero'] },
  difficulty: { type: String, required: [true, 'Workout difficulty is required'], trim: true },
});

export const Workout = model('Workout', workoutSchema);
