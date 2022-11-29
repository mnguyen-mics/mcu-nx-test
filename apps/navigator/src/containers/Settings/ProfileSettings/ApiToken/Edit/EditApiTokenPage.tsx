import * as React from 'react';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { WrappedComponentProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { message } from 'antd';
import { connect } from 'react-redux';
import { Loading } from '../../../../../components/index';
import { UserProfileResource } from '../../../../../models/directory/UserProfileResource';
import ApiTokenResource from '../../../../../models/directory/ApiTokenResource';
import { notifyError } from '../../../../../redux/Notifications/actions';
import EditApiTokenForm from './EditApiTokenForm';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IApiTokenService } from '../../../../../services/ApiTokenService';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

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

interface State {
  loading: boolean;
  apiTokenData: Partial<ApiTokenResource>;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

type Props = WrappedComponentProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string; apiTokenId: string }>;

class EditApiTokenPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IApiTokenService)
  private _apiTokenService: IApiTokenService;

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
      this._apiTokenService
        .getApiToken(apiTokenId, connectedUser.id, organisationId)
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

  save = (formData: Partial<ApiTokenResource>) => {
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
    const hideSaveInProgress = message.loading(intl.formatMessage(messages.savingInProgress), 0);
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
      createOrUpdateApiTokenPromise = this._apiTokenService.updateApiToken(
        apiTokenId,
        connectedUser.id,
        organisationId,
        formData,
      );
    } else {
      createOrUpdateApiTokenPromise = this._apiTokenService.createApiToken(
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
        params: { organisationId, apiTokenId },
      },
    } = this.props;
    const { apiTokenData, loading } = this.state;

    const apiTokenName = apiTokenId
      ? formatMessage(messages.editApiToken, {
          name: apiTokenData.name,
        })
      : formatMessage(messages.apiToken);
    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/settings/account/api_tokens`}>
        {formatMessage(messages.apiTokens)}
      </Link>,
      apiTokenName,
    ];

    if (loading) {
      return <Loading isFullScreen={true} />;
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

const mapStateToProps = (state: MicsReduxState) => ({
  connectedUser: state.session.connectedUser,
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(EditApiTokenPage);
