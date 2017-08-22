export const defaultState = {
  identifiers: {
    isLoading: false,
    hasItems: true,
    items: {
      USER_ACCOUNT: [],
      USER_AGENT: [],
      USER_EMAIL: [],
      USER_POINT: [],
    },
  },
  profile: {
    isLoading: false,
    hasItems: true,
    items: {
    },
  },
  segments: {
    isLoading: false,
    hasItems: true,
    items: [],
  },
  activities: {
    isLoading: false,
    hasItems: true,
    items: [],
    byDay: {},
    nextDate: new Date(),
    fetchNewActivities: () => {},
  },
};
