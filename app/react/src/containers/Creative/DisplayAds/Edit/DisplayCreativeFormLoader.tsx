import * as React from 'react';
import { compose } from 'recompose';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import { RouteComponentProps, withRouter } from 'react-router';
import { DisplayCreativeFormProps } from './DisplayCreativeForm';
import { DisplayCreativeFormData } from './domain';
import { Loading } from '../../../../components/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IDisplayCreativeFormService } from './DisplayCreativeFormService';

export interface DisplayCreativeFormLoaderProps extends DisplayCreativeFormProps {
  creativeId: string;
}

type JoinedProps = DisplayCreativeFormLoaderProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface DisplayCreativeFormLoaderState {
  isLoading: boolean;
  creativeFormData: Partial<DisplayCreativeFormData>;
}

class DisplayCreativeFormLoader extends React.Component<
  JoinedProps,
  DisplayCreativeFormLoaderState
> {
  @lazyInject(TYPES.IDisplayCreativeFormService)
  private _displayCreativeFormService: IDisplayCreativeFormService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      isLoading: true,
      creativeFormData: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      creativeId,
    } = this.props;
    this.loadFormData(organisationId, creativeId);
  }

  loadFormData = (organisationId: string, creativeId: string) => {
    this.setState({ isLoading: true });

    this._displayCreativeFormService
      .loadFormData(creativeId)
      .then(creativeFormData => {
        this.setState({
          creativeFormData,
          isLoading: false,
        });
      })
      .catch(err => {
        log.debug(err);
        this.props.notifyError(err);
        this.setState(() => {
          return { isLoading: false };
        });
      });
  };

  saveFormData = () => {
    this.setState({ isLoading: true });
  };

  render() {
    const { creativeId, ...rest } = this.props;

    if (this.state.isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return <DisplayCreativeForm {...rest} initialValues={this.state.creativeFormData} />;
  }
}

export default compose<JoinedProps, DisplayCreativeFormLoaderProps>(
  withRouter,
  injectNotifications,
)(DisplayCreativeFormLoader);
