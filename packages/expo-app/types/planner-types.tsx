/**
 * Represents the geographic coordinates for a place.
 */
export interface Location {
    lat: number;
    lng: number;
  }
  
  /**
   * Defines the status of a place in the itinerary.
   */
  export type PlaceStatus = 'want-to-go' | 'scheduled' | 'visited';
  
  /**
   * Defines the type of establishment or activity.
   */
  export type PlaceType = 'activity' | 'restaurant' | 'hotel' | 'other';
  
  /**
   * Represents a single place or activity in the trip.
   */
  export interface Place {
    id: string;
    name: string;
    location: Location;
    status: PlaceStatus;
    visited: boolean;
    scheduledTime: string | null; // ISO 8601 string
    type: PlaceType;
    notes?: string;
  }
  
  /**
   * Details about the overall trip.
   */
export interface TripDetails {
  destination: string;
  startDate: string | null; // ISO 8601 string (date only)
  endDate: string | null; // ISO 8601 string (date only)
}
  
  /**
   * Represents a complete Trip, including its details and places.
   */
export interface Trip {
  id: string;
  details: TripDetails;
  places: Place[];
  dailyTravelTimes?: Record<string, number[]>;
}
  
  /**
   * The complete state for the trip store.
   */
  export interface TripState {
    trips: Trip[];
    // You could add an 'activeTripId' here later for the map/chat
  }