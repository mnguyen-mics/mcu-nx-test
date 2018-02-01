import { connect } from 'react-redux';
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
} from '../../state/Notifications/actions';

// TODO type any ( goes with notif action creators)
export interface InjectedNotificationProps {
  notifyError: (err: any) => void;
  notifySuccess: (notifConfig: any) => void;
  notifyWarning: (notifConfig: any) => void;
  notifyInfo: (notifConfig: any) => void;
}

const mapDispatchToProps = {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
};

export default connect(undefined, mapDispatchToProps);
