import { Schema, model, Document } from 'mongoose';

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

const BoardSchema = new Schema<IBoard>({
  title: { type: String, required: true, trim: true },
  lists: [ListSchema]
}, { timestamps: true });

export const Board = model<IBoard>('Board', BoardSchema);