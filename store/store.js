import { getNanoId } from "@/lib/random";
import { create } from "zustand";

const keyMap = {
  source: "sources",
  note: "notes",
  quiz: "quizzes",
  course: "courses",
  group: "groups",
  associate: "associates",
  relationship: "relationships",
  blocked: "blocked",
  notification: "notifications",
};

export const useStore = create((set) => ({
  user: null,

  sources: [],
  notes: [],
  quizzes: [],
  courses: [],

  groups: [],

  associates: [],
  blocked: [],

  notifications: [],

  inputDefaults: {
    courses: [],
    sources: [],
    notes: [],
    quizzes: [],
    tags: [],
    permissions: {
      allRead: false,
      allWrite: false,
      read: [],
      write: [],
      groupId: null,
      groupLocked: false,
    },
  },

  setUser: (user) =>
    set(() => {
      return { user };
    }),

  setSettings: (settings) => {
    return set((state) => {
      if (!state.user) {
        return state;
      }

      return {
        user: {
          ...state.user,
          settings: {
            ...state.user.settings,
            ...settings,
          },
        },
      };
    });
  },

  setInputDefaults: (defaults) => {
    return set((state) => ({
      inputDefaults: {
        ...state.inputDefaults,
        ...defaults,
      },
    }));
  },

  fillInitialData: (data) => set(() => ({ ...data })),

  addItem: (type, item) => {
    if (!keyMap[type]) {
      return;
    }

    return set((state) => ({
      ...state,
      [keyMap[type]]: [...state[keyMap[type]], item],
    }));
  },

  updateItem: (type, updatedItem) => {
    if (!keyMap[type]) {
      return;
    }

    return set((state) => ({
      ...state,
      [keyMap[type]]: state[keyMap[type]].map((x) =>
        x.id === updatedItem.id ? updatedItem : x
      ),
    }));
  },

  removeItem: (type, id) => {
    if (!keyMap[type]) {
      return;
    }

    return set((state) => ({
      ...state,
      [keyMap[type]]: state[keyMap[type]].filter((item) => item.id !== id),
    }));
  },

  readNotification: (id) => {
    return set((state) => ({
      notifications: state.notifications.map((n) => {
        if (n.id === id) {
          n.read = true;
        }

        return n;
      }),
    }));
  },

  readAllNotifications: () => {
    return set((state) => ({
      notifications: state.notifications.map((n) => {
        n.read = true;
        return n;
      }),
    }));
  },
}));

// Daily Train Store

export const useDailyTrain = create()((set) => ({
  start: false,
  isPaused: false,

  settings: {
    timeLimit: 60 * 15,
    tags: [],
    courses: [],
    sources: [],
    notes: [],
  },

  setStart: (start) => set(() => ({ start })),
  setIsPaused: (isPaused) => set(() => ({ isPaused })),
  setTimeLimit: (timeLimit) => set(() => ({ timeLimit })),

  setSettings: (newValues) => {
    return set((state) => ({
      settings: {
        ...state.settings,
        ...newValues,
      },
    }));
  },
}));

// Alerts Store

export const useAlerts = create()((set) => ({
  alerts: [],

  addAlert: (alert) => {
    return set((state) => ({
      alerts: [
        ...state.alerts,
        {
          id: getNanoId(),
          ...alert,
        },
      ],
    }));
  },

  removeAlert: (id) => {
    return set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },
}));
