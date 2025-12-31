import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '@/types/event';
import {
  scheduleEventNotification,
  cancelEventNotification,
} from './notification-service';

const STORAGE_KEY = '@schedule_events';

interface EventState {
  events: Event[];
  isLoading: boolean;
}

type EventAction =
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

interface EventContextType extends EventState {
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsByDate: (date: string) => Event[];
  getEventById: (id: string) => Event | undefined;
  getUpcomingEvents: () => Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload, isLoading: false };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventReducer, {
    events: [],
    isLoading: true,
  });

  // Load events from storage on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const events = JSON.parse(stored) as Event[];
        dispatch({ type: 'SET_EVENTS', payload: events });
      } else {
        dispatch({ type: 'SET_EVENTS', payload: [] });
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      dispatch({ type: 'SET_EVENTS', payload: [] });
    }
  };

  const saveEvents = async (events: Event[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  };

  const addEvent = useCallback(
    async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
      const now = new Date().toISOString();
      const newEvent: Event = {
        ...eventData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };

      // Schedule notification if reminder is set
      if (eventData.reminder !== undefined && eventData.reminder >= 0) {
        const notificationId = await scheduleEventNotification(newEvent);
        if (notificationId) {
          newEvent.notificationId = notificationId;
        }
      }

      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      await saveEvents([...state.events, newEvent]);
      return newEvent;
    },
    [state.events]
  );

  const updateEvent = useCallback(
    async (event: Event) => {
      const existingEvent = state.events.find((e) => e.id === event.id);
      
      // Cancel existing notification if any
      if (existingEvent?.notificationId) {
        await cancelEventNotification(existingEvent.notificationId);
      }

      const updatedEvent: Event = { ...event, updatedAt: new Date().toISOString(), notificationId: undefined };

      // Schedule new notification if reminder is set
      if (event.reminder !== undefined && event.reminder >= 0) {
        const notificationId = await scheduleEventNotification(updatedEvent);
        if (notificationId) {
          updatedEvent.notificationId = notificationId;
        }
      }

      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
      const updatedEvents = state.events.map((e) =>
        e.id === event.id ? updatedEvent : e
      );
      await saveEvents(updatedEvents);
    },
    [state.events]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const eventToDelete = state.events.find((e) => e.id === id);
      
      // Cancel notification if any
      if (eventToDelete?.notificationId) {
        await cancelEventNotification(eventToDelete.notificationId);
      }

      dispatch({ type: 'DELETE_EVENT', payload: id });
      const filteredEvents = state.events.filter((e) => e.id !== id);
      await saveEvents(filteredEvents);
    },
    [state.events]
  );

  const getEventsByDate = useCallback(
    (date: string): Event[] => {
      return state.events
        .filter((e) => e.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
    [state.events]
  );

  const getEventById = useCallback(
    (id: string): Event | undefined => {
      return state.events.find((e) => e.id === id);
    },
    [state.events]
  );

  const getUpcomingEvents = useCallback((): Event[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return state.events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [state.events]);

  return (
    <EventContext.Provider
      value={{
        ...state,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsByDate,
        getEventById,
        getUpcomingEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
