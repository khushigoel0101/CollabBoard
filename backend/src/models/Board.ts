import mongoose, { Schema, model, Document } from 'mongoose';

export interface ICard {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
}

export interface IList {
  _id: string;
  title: string;
  cards: ICard[];
}

export interface IBoard extends Document {
  title: string;
  lists: IList[];
  createdAt: Date;
}

const CardSchema = new Schema<ICard>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  tags: [{ type: String }]
});

const ListSchema = new Schema<IList>({
  title: { type: String, required: true, trim: true },
  cards: [CardSchema]
});

const BoardSchema = new Schema({
  title: { type: String, required: true },
  // Track who created it
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Array of team members who have accepted the invite link
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lists: [
    {
      _id: { type: String, required: true },
      title: { type: String, required: true },
      cards: [
        {
          _id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, default: '' },
          tags: [String]
        }
      ]
    }
  ]
}, { timestamps: true });

export const Board = mongoose.model('Board', BoardSchema);