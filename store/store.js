import { getNanoId } from "@/lib/random";
import { create } from "zustand";

export const useStore = create((set) => ({
    user: null,

    sources: [],
    notes: [],
    quizzes: [],
    courses: [],

    groups: [],
    associates: [],
    notifications: [],

    setUser: (user) => set(() => ({ user })),

    fillInitialData: (data) => {
        return set(() => ({
            user: data.user,
            sources: data.sources,
            notes: data.notes,
            quizzes: data.quizzes,
            courses: data.courses,
            groups: data.groups,
            associates: data.associates,
            notifications: data.notifications,
        }));
    },

    addItem: (type, item) => {
        return set((state) => {
            return {
                sources:
                    type === "source"
                        ? [...state.sources, item]
                        : state.sources,
                notes: type === "note" ? [...state.notes, item] : state.notes,
                quizzes:
                    type === "quiz" ? [...state.quizzes, item] : state.quizzes,
                courses:
                    type === "course"
                        ? [...state.courses, item]
                        : state.courses,
                groups:
                    type === "group" ? [...state.groups, item] : state.groups,
                associates:
                    type === "associate"
                        ? [...state.associates, item]
                        : state.associates,
                notifications:
                    type === "notification"
                        ? [...state.notifications, item]
                        : state.notifications,
            };
        });
    },

    removeItem: (type, id) => {
        return set((state) => {
            return {
                sources:
                    type === "source"
                        ? state.sources.filter((source) => source.id !== id)
                        : state.sources,
                notes:
                    type === "note"
                        ? state.notes.filter((note) => note.id !== id)
                        : state.notes,
                quizzes:
                    type === "quiz"
                        ? state.quizzes.filter((quiz) => quiz.id !== id)
                        : state.quizzes,
                courses:
                    type === "course"
                        ? state.courses.filter((course) => course.id !== id)
                        : state.courses,
                groups:
                    type === "group"
                        ? state.groups.filter((group) => group.id !== id)
                        : state.groups,
                associates:
                    type === "associate"
                        ? state.associates.filter(
                              (associate) => associate.id !== id,
                          )
                        : state.associates,
                notifications:
                    type === "notification"
                        ? state.notifications.filter(
                              (notification) => notification.id !== id,
                          )
                        : state.notifications,
            };
        });
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
