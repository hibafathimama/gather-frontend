export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface ReviewType {
  _id: string;
  user: ReviewUser;
  event: string | {
    _id: string;
    eventName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRatingType {
  averageRating: number;
  totalReviews: number;
}
