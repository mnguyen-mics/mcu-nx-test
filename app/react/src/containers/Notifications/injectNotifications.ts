import { connect } from 'react-redux';
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
  removeNotification,
  resetNotifications,
} from '../../state/Notifications/actions.js';
import { Action } from 'redux-actions';

// TODO type any ( goes with notif action creators)
export interface InjectedNotificationProps {
  notifyError: (err: any, notifConfig?: any) => Action<void>;
  notifySuccess: (notifConfig: any) => Action<void>;
  notifyWarning: (notifConfig: any) => Action<void>;
  notifyInfo: (notifConfig: any) => Action<void>;
  removeNotification: (key: string) => Action<void>;
  resetNotifications: () => Action<void>;
}

const mapDispatchToProps = {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
  removeNotification,
  resetNotifications,
};

export default connect(undefined, mapDispatchToProps);
