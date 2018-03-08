import { connect } from 'react-redux';
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
  removeNotification,
  resetNotifications,
} from '../../state/Notifications/actions.js';

// TODO type any ( goes with notif action creators)
export interface InjectedNotificationProps {
  notifyError: (err: any, notifConfig?: any) => void;
  notifySuccess: (notifConfig: any) => void;
  notifyWarning: (notifConfig: any) => void;
  notifyInfo: (notifConfig: any) => void;
  removeNotification: (key: string) => void;
  resetNotifications: () => void;
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
