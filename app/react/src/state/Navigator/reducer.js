import {
  NAVIGATOR_NOTIFICATIONS_ADD,
  NAVIGATOR_NOTIFICATIONS_REMOVE,
  NAVIGATOR_NOTIFICATIONS_RESET,

  NAVIGATOR_VERSION_REQUEST,
  NAVIGATOR_VERSION_FAILURE,
  NAVIGATOR_VERSION_SUCCESS
} from '../action-types';

const defaultNavigatorState = {
  version: null,
  notifications: [
    /**
     * Notification format:
     * {
     *  type: 'error' || 'info' || 'warning' || 'success'  || 'reload',
     *  messageKey: String,
     *  descriptionKey: String,
     *  values: Object
     * }
     */
  ]
};

const navigator = (state = defaultNavigatorState, action) => {

  switch (action.type) {
    case NAVIGATOR_NOTIFICATIONS_ADD:
      return {
        ...state,
        notifications: state.notifications.concat({
          type: action.payload.type,
          messageKey: action.payload.messageKey,
          descriptionKey: action.payload.descriptionKey,
          values: action.payload.values
        })
      };

    case NAVIGATOR_NOTIFICATIONS_REMOVE:
      return {
        ...state,
        notifications: [
          ...state.notifications.slice(0, action.payload),
          ...state.notifications.slice(action.payload + 1)
        ]
      };

    case NAVIGATOR_NOTIFICATIONS_RESET:
      return {
        ...state,
        notifications: defaultNavigatorState.notifications
      };

    case NAVIGATOR_VERSION_SUCCESS:
      return {
        ...state,
        version: action.response.version
      };

    case NAVIGATOR_VERSION_REQUEST:
    case NAVIGATOR_VERSION_FAILURE:
    default:
      return state;
  }

};

const NavigatorReducers = {
  navigator
};

export default NavigatorReducers;

