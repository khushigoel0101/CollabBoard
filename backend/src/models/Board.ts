import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface ICard {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  tags: string[];
}

export interface IList {
  _id: Types.ObjectId;
  title: string;
  cards: ICard[];
}

export interface IBoard extends Document {
  title: string;
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
  lists: IList[];
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] }
  },
  { _id: true }
);

const ListSchema = new Schema<IList>(
  {
    title: { type: String, required: true, trim: true },
    cards: { type: [CardSchema], default: [] }
  },
  { _id: true }
);

const BoardSchema = new Schema<IBoard>(
  {
    title: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    lists: { type: [ListSchema], default: [] }
  },
  { timestamps: true }
);

BoardSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    if (ret._id) {
      const id = ret._id;
      return { ...ret, _id: id.toString() };
    }
    return ret;
  }
});

export const Board = mongoose.model<IBoard>('Board', BoardSchema);