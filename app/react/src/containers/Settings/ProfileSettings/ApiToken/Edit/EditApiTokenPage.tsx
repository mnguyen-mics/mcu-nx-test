import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { message } from 'antd';
import { connect } from 'react-redux';
import { Loading } from '../../../../../components/index';
import {
  ConnectedUser,
  ApiToken,
} from '../../../../../models/settings/settings';
import { notifyError } from '../../../../../state/Notifications/actions';
import ApiTokenService from '../../../../../services/ApiTokenService';
import EditApiTokenForm from './EditApiTokenForm';

const messages = defineMessages({
  newApiToken: {
    id: 'new.ApiToken',
    defaultMessage: 'New Api Token',
  },
  apiTokens: {
    id: 'edit.ApiToken.ApiToken',
    defaultMessage: 'Api Tokens',
  },
  apiToken: {
    id: 'edit.apiToken.apiToken',
    defaultMessage: 'Api Token',
  },
  editApiToken: {
    id: 'edit.ApiToken',
    defaultMessage: 'Edit {name}',
  },
  savingInProgress: {
    id: 'form.ApiToken.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
  updateSuccess: {
    id: 'edit.ApiToken.success.message',
    defaultMessage: 'Api Token successfully saved ',
  },
  updateError: {
    id: 'edit.ApiToken.error.message',
    defaultMessage: 'Api Token update failed ',
  },
});

interface EditApiTokenPageProps {}

interface State {
  loading: boolean;
  apiTokenData: Partial<ApiToken>;
}

interface MapStateToProps {
  connectedUser: ConnectedUser;
}

type Props = EditApiTokenPageProps &
  InjectedIntlProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string; apiTokenId: string }>;

class EditApiTokenPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      apiTokenData: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, apiTokenId },
      },
      connectedUser,
    } = this.props;
    if (apiTokenId) {
      ApiTokenService.getApiToken(apiTokenId, connectedUser.id, organisationId)
        .then(resp => resp.data)
        .then(apiTokenData => {
          this.setState({
            apiTokenData: apiTokenData,
          });
        });
    }
  }

  close = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/settings/account/api_tokens`;
    return history.push(url);
  };

  save = (formData: Partial<ApiToken>) => {
    const {
      match: {
        params: { organisationId, apiTokenId },
      },
      intl,
      connectedUser,
    } = this.props;
    this.setState({
      loading: true,
    });
    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );
    const redirectAndNotify = (success: boolean = false) => {
      this.setState({
        loading: false,
      });
      hideSaveInProgress();
      this.close();
      success
        ? message.success(intl.formatMessage(messages.updateSuccess))
        : message.error(intl.formatMessage(messages.updateError));
    };
    let createOrUpdateApiTokenPromise;
    if (apiTokenId) {
      createOrUpdateApiTokenPromise = ApiTokenService.updateApiToken(
        apiTokenId,
        connectedUser.id,
        organisationId,
        formData,
      );
    } else {
      createOrUpdateApiTokenPromise = ApiTokenService.createApiToken(
        connectedUser.id,
        organisationId,
        formData,
      );
    }
    createOrUpdateApiTokenPromise
      .then(() => {
        redirectAndNotify(true);
      })
      .catch(err => {
        redirectAndNotify();
        notifyError(err);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { apiTokenData, loading } = this.state;

    // const userName = apiTokenId
    //   ? formatMessage(messages.editApiToken, {
    //       name: apiTokenData.???
    //         ? userData.first_name
    //         : formatMessage(messages.user),
    //     })
    //   : formatMessage(messages.newUser);
    const breadcrumbPaths = [
      {
        name: formatMessage(messages.apiTokens),
        url: `/v2/o/${organisationId}/settings/account/api_tokens`,
      },
      {
        name: 'apiToken', // change
      },
    ];

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <EditApiTokenForm
        initialValues={apiTokenData}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  connectedUser: state.session.connectedUser,
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(EditApiTokenPage);
