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

export interface IBoard {
  _id: string;
  title: string;
  lists: IList[];
  createdAt: string;
  updatedAt: string;
}