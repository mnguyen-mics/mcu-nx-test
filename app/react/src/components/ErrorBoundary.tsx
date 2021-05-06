import * as React from 'react';
import injectNotifications, {
  InjectedNotificationProps,
} from '../containers/Notifications/injectNotifications';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';

interface State {
  hasError: boolean;
}

const messageProps = {
  id: 'components.errorBoundary.hasError.msg',
  defaultMessage: 'Something went wrong',
};

type Props = InjectedNotificationProps;

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(error: any, info: any) {
    this.setState({ hasError: true });
    this.props.notifyError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='ant-layout'>
          <FormattedMessage {...messageProps} />
        </div>
      );
    }
    return this.props.children;
  }
}
export default compose(injectNotifications)(ErrorBoundary);
