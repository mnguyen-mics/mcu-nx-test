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
  notifyError: (err: any, notifConfig?: any) => Action<any>;
  notifySuccess: (notifConfig: any) => Action<any>;
  notifyWarning: (notifConfig: any) => Action<any>;
  notifyInfo: (notifConfig: any) => Action<any>;
  removeNotification: (key: string) => Action<any>;
  resetNotifications: () => Action<any>;
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
