import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';

import NativeCreativeRendererSelector from './NativeCreativeRendererSelector';
import log from '../../../../utils/Logger';
import { NativeCreativeFormData } from './domain';
import { DisplayCreativeFormProps } from '../../DisplayAds/Edit/DisplayCreativeForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import NativeCreativeForm from './NativeCreativeForm';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IDisplayCreativeFormService } from '../../DisplayAds/Edit/DisplayCreativeFormService';
import { Loading } from '@mediarithmics-private/mcs-components-library';

export interface NativeCreativeCreatorProps extends DisplayCreativeFormProps {}

interface State {
  isLoading: boolean;
  nativeFormData: Partial<NativeCreativeFormData>;
}

type Props = NativeCreativeCreatorProps &
  InjectedIntlProps &
  InjectedNotificationProps;

class NativeCreativeCreator extends React.Component<Props, State> {
  @lazyInject(TYPES.IDisplayCreativeFormService)
  private _displayCreativeFormService: IDisplayCreativeFormService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      nativeFormData: {},
    };
  }

  loadFormData = (adRendererId: string) => {
    this.setState({ isLoading: true });
    this._displayCreativeFormService
      .initializeFormData(adRendererId, 'NATIVE', '640x190')
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

    if (isLoading) return <Loading isFullScreen={true} />;

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
