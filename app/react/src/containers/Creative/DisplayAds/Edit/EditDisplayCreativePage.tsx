import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import queryString from 'query-string';
import DisplayCreativeFormLoader from './DisplayCreativeFormLoader';
import { DisplayCreativeCreator } from './index';
import messages from './messages';
import {
  DisplayCreativeFormData,
  EditDisplayCreativeRouteMatchParams,
} from './domain';
import DisplayCreativeFormService from './DisplayCreativeFormService';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

interface State {
  loading: boolean;
}

type Props = RouteComponentProps<EditDisplayCreativeRouteMatchParams> &
  InjectedNotificationProps &
  InjectedIntlProps;

class EditDisplayCreativePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  redirect = () => {
    const {
      history,
      location: { search, state },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const subtype = queryString.parse(search).subtype
      ? queryString.parse(search).subtype
      : undefined;

    const url =
      state && state.from
        ? state.from
        : subtype === 'native'
          ? `/v2/o/${organisationId}/creatives/native`
          : `/v2/o/${organisationId}/creatives/display`;

    history.push(url);
  };

  onSave = (creativeData: DisplayCreativeFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
      location: { search },
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    const subtype = queryString.parse(search).subtype
      ? queryString.parse(search).subtype
      : undefined;

    DisplayCreativeFormService.saveDisplayCreative(
      organisationId,
      creativeData,
      subtype,
    )
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
        params: { creativeId },
      },
      location: { search },
    } = this.props;

    const query = queryString.parse(search);

    const actionBarButtonText = messages.creativeCreationSaveButton;

    const breadCrumbPaths = [
      {
        name: creativeId
          ? messages.creativeEditionBreadCrumb
          : query.subtype === 'native'
            ? messages.nativeCreationBreadCrumb
            : messages.creativeCreationBreadCrumb,
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

    return creativeId ? (
      <DisplayCreativeFormLoader {...props} creativeId={creativeId} />
    ) : (
      <DisplayCreativeCreator {...props} />
    );
  }
}

export default compose<Props, {}>(injectIntl, withRouter, injectNotifications)(
  EditDisplayCreativePage,
);
