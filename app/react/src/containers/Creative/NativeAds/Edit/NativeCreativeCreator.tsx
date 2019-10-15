import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';

import NativeCreativeRendererSelector from './NativeCreativeRendererSelector';
import log from '../../../../utils/Logger';
import { NativeCreativeFormData } from './domain';
import Loading from '../../../../components/Loading';
import DisplayCreativeFormService from './../../DisplayAds/Edit/DisplayCreativeFormService';
import { DisplayCreativeFormProps } from '../../DisplayAds/Edit/DisplayCreativeForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import NativeCreativeForm from './NativeCreativeForm';

export interface NativeCreativeCreatorProps extends DisplayCreativeFormProps {}

interface State {
  isLoading: boolean;
  nativeFormData: Partial<NativeCreativeFormData>;
}

type Props = NativeCreativeCreatorProps &
  InjectedIntlProps &
  InjectedNotificationProps;

class NativeCreativeCreator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      nativeFormData: {},
    };
  }

  loadFormData = (adRendererId: string) => {
    this.setState({ isLoading: true });
    DisplayCreativeFormService.initializeFormData(adRendererId, 'NATIVE', '640x190')
      .then(nativeFormData =>
        this.setState({
          nativeFormData,
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
      nativeFormData: {},
    });
  };

  render() {
    const { nativeFormData, isLoading } = this.state;

    if (isLoading) return <Loading className="loading-full-screen" />;

    const initialValues = this.props.initialValues || nativeFormData;

    return Object.keys(initialValues).length > 0 ? (
      <NativeCreativeForm
        {...this.props}
        initialValues={initialValues}
        goToCreativeTypeSelection={this.resetFormData}
      />
    ) : (
      <NativeCreativeRendererSelector
        onSelect={this.loadFormData}
        close={this.props.close}
      />
    );
  }
}

export default compose<Props, NativeCreativeCreatorProps>(injectNotifications)(
    NativeCreativeCreator,
);
