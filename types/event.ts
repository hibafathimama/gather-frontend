export interface EventType {
_id: string;
eventName: string;
category: string;
date: string;
time?: string;
venue?: string;
location?: string;
description?: string;
ticketPrice: number;
availableSeats: number;
totalSeats: number;
image?: string;
}
