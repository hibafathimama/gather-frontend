import api from "@/lib/api";
import { ReviewType, EventRatingType } from "@/types/review";

// Add a review
export const addReview = async (
  eventId: string,
  rating: number,
  comment: string
) => {
  const response = await api.post("/reviews", {
    eventId,
    rating,
    comment,
  });

  return response.data;
};

// Get all reviews for an event
export const getEventReviews = async (
  eventId: string
): Promise<ReviewType[]> => {
  const response = await api.get(`/reviews/event/${eventId}`);
  return response.data.data;
};

// Get average rating and total reviews
export const getEventRating = async (
  eventId: string
): Promise<EventRatingType> => {
  const response = await api.get(`/reviews/event/${eventId}/rating`);
  return response.data.data;
};

// Update your review
export const updateReview = async (
  reviewId: string,
  rating: number,
  comment: string
) => {
  const response = await api.put(`/reviews/${reviewId}`, {
    rating,
    comment,
  });

  return response.data;
};

// Delete your review
export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const getOrganizerEventReviews = async (eventId: string) => {
  const response = await api.get(
    `/reviews/organizer/event/${eventId}`
  );

  return response.data.data;
};