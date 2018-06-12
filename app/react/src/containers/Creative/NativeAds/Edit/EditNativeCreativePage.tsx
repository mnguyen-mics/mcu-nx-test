import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import DisplayCreativeFormLoader from '../../DisplayAds/Edit/DisplayCreativeFormLoader';
import NativeCreativeCreator from './NativeCreativeCreator';
import messages from './messages';
import {
  NativeCreativeFormData,
  EditNativeCreativeRouteMatchParams,
} from './domain';
import DisplayCreativeFormService from '../../DisplayAds/Edit/DisplayCreativeFormService';
import CreativeService from '../../../../services/CreativeService';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

interface State {
  loading: boolean;
  nativeName: string;
}

type Props = RouteComponentProps<EditNativeCreativeRouteMatchParams> &
  InjectedNotificationProps &
  InjectedIntlProps;

class EditNativeCreativePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      nativeName: '',
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { nativeId },
      },
    } = this.props;
    if (nativeId) {
      CreativeService.getCreative(nativeId)
        .then(resp => resp.data)
        .then(nativeData => {
          this.setState({
            nativeName: nativeData.name
              ? nativeData.name
              : `creative ${nativeData.id}`,
          });
        });
    }
  }

  redirect = () => {
    const {
      history,
      location: { state },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url =
      state && state.from
        ? state.from
        : `/v2/o/${organisationId}/creatives/native`;

    history.push(url);
  };

  onSave = (nativeData: NativeCreativeFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    nativeData = {
      ...nativeData,
      creative: {
        ...nativeData.creative,
        subtype: 'NATIVE',
      },
    };

    DisplayCreativeFormService.saveDisplayCreative(organisationId, nativeData)
      .then(() => {
        hideSaveInProgress();
        this.redirect();
      })
      .catch(err => {
        hideSaveInProgress();
        this.props.notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  render() {
    const {
      match: {
        params: { nativeId, organisationId },
      },
      intl,
    } = this.props;

    const { nativeName } = this.state;

    const actionBarButtonText = messages.save;

    const breadCrumbToList = {
      name: messages.nativeListBreadCrumb,
      path: `/v2/o/${organisationId}/creatives/native`,
    };

    const creaName = nativeId
      ? intl.formatMessage(messages.creativeEditionBreadCrumb, {
          name: nativeName,
        })
      : messages.nativeCreationBreadCrumb;

    const breadCrumbPaths = [
      {
        ...breadCrumbToList,
      },
      {
        name: creaName,
      },
    ];

    const props = {
      close: this.redirect,
      onSubmit: this.onSave,
      actionBarButtonText: actionBarButtonText,
      breadCrumbPaths: breadCrumbPaths,
      onSubmitFail: this.onSubmitFail,
    };

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
    }

    return nativeId ? (
      <DisplayCreativeFormLoader {...props} creativeId={nativeId} />
    ) : (
      <NativeCreativeCreator {...props} />
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
)(EditNativeCreativePage);
