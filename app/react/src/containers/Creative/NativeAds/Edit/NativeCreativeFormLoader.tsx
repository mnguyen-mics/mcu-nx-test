import * as React from 'react';
import { compose } from 'recompose';

import log from '../../../../utils/Logger';
import { RouteComponentProps, withRouter } from 'react-router';
import { DisplayCreativeFormProps } from '../../DisplayAds/Edit/DisplayCreativeForm';
import { DisplayCreativeFormData } from '../../DisplayAds/Edit/domain';
import { Loading } from '../../../../components/index';
import { IDisplayCreativeFormService } from '../../DisplayAds/Edit/DisplayCreativeFormService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import NativeCreativeForm from './NativeCreativeForm';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';

export interface NativeCreativeFormLoaderProps
  extends DisplayCreativeFormProps {
  creativeId: string;
}

type JoinedProps = NativeCreativeFormLoaderProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface DisplayCreativeFormLoaderState {
  isLoading: boolean;
  creativeFormData: Partial<DisplayCreativeFormData>;
}

class NativeCreativeFormLoader extends React.Component<
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

    return (
      <NativeCreativeForm
        {...rest}
        initialValues={this.state.creativeFormData}
      />
    );
  }
}

export default compose<JoinedProps, NativeCreativeFormLoaderProps>(
  withRouter,
  injectNotifications,
)(NativeCreativeFormLoader);
