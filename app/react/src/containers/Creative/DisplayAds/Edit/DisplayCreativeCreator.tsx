import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';

import DisplayCreativeRendererSelector from './DisplayCreativeRendererSelector';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import { DisplayCreativeFormData } from './domain';
import Loading from '../../../../components/Loading';
import DisplayCreativeFormService from './DisplayCreativeFormService';
import { DisplayCreativeFormProps } from './DisplayCreativeForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

export interface DisplayCreativeCreatorProps extends DisplayCreativeFormProps {}

interface State {
  isLoading: boolean;
  creativeFormData: Partial<DisplayCreativeFormData>;
}

type Props = DisplayCreativeCreatorProps &
  InjectedIntlProps &
  InjectedNotificationProps;

class DisplayCreativeCreator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      creativeFormData: {},
    };
  }

  loadFormData = (adRendererId: string) => {
    this.setState({ isLoading: true });
    DisplayCreativeFormService.initializeFormData(adRendererId, 'BANNER')
      .then(creativeFormData =>
        this.setState({
          creativeFormData,
          isLoading: false,
        }),
      )
      .catch(err => {
        log.debug(err);
        this.props.notifyError(err);
        this.setState(() => {
          return { isLoading: false };
        });
      });
  };

  resetFormData = () => {
    this.setState({
      creativeFormData: {},
    });
  };

  render() {
    const { creativeFormData, isLoading } = this.state;

    if (isLoading) return <Loading className="loading-full-screen" />;

    const initialValues = this.props.initialValues || creativeFormData;

    return Object.keys(initialValues).length > 0 ? (
      <DisplayCreativeForm
        {...this.props}
        initialValues={initialValues}
        goToCreativeTypeSelection={this.resetFormData}
      />
    ) : (
      <DisplayCreativeRendererSelector
        onSelect={this.loadFormData}
        close={this.props.close}
      />
    );
  }
}

export default compose<Props, DisplayCreativeCreatorProps>(injectNotifications)(
  DisplayCreativeCreator,
);
