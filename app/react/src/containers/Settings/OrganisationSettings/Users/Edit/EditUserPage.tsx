import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { message } from 'antd';
import { Loading } from '../../../../../components/index';
import EditUserForm from './EditUserForm';
import UserResource from '../../../../../models/directory/UserResource';
import { notifyError } from '../../../../../redux/Notifications/actions';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IUsersService } from '../../../../../services/UsersService';
import { ErrorResponse } from '../../../../../services/ApiService';
import { Link } from 'react-router-dom';

const messages = defineMessages({
  newUser: {
    id: 'settings.organisation.users.edit.newUser',
    defaultMessage: 'New User',
  },
  users: {
    id: 'settings.organisation.users.edit.users',
    defaultMessage: 'Users',
  },
  user: {
    id: 'settings.organisation.users.edit.user',
    defaultMessage: 'User',
  },
  editUser: {
    id: 'settings.organisation.users.edit.edit',
    defaultMessage: 'Edit {name}',
  },
  savingInProgress: {
    id: 'settings.organisation.users.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
  updateSuccess: {
    id: 'settings.organisation.users.edit.UserSuccessfullySaved',
    defaultMessage: 'User successfully saved ',
  },
  updateError: {
    id: 'settings.organisation.users.edit.userUpdateFailed',
    defaultMessage: 'User update failed ',
  },
  emailAlreadyExists: {
    id: 'settings.organisation.users.edit.emailAlreadyExists',
    defaultMessage: 'Email already exists ',
  },
});

function updateErrorMessage(err: ErrorResponse) {
  if(err.error_code === "EMAIL_ALREADY_EXISTS")
    return messages.emailAlreadyExists;
  else
    return messages.updateError;
}

const INITIAL_USER_FORM_DATA: Partial<UserResource> = {
  first_name: '',
  email: ''
}

interface State {
  loading: boolean;
  userData: Partial<UserResource>;
}

type Props = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; userId: string }>;

class EditUserPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      userData: INITIAL_USER_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, userId },
      },
    } = this.props;
    if (userId) {
      this._usersService
        .getUser(userId, organisationId)
        .then(resp => resp.data)
        .then(userData => {
          this.setState({
            userData: userData,
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

    const url = `/v2/o/${organisationId}/settings/organisation/users`;

    return history.push(url);
  };

  save = (formData: Partial<UserResource>) => {
    const {
      match: {
        params: { organisationId, userId },
      },
      intl,
    } = this.props;
    this.setState({
      loading: true,
    });
    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );
    const redirectAndNotify = (err: ErrorResponse | null = null) => {
      this.setState({
        loading: false,
      });
      hideSaveInProgress();
      this.close();
      err === null
        ? message.success(intl.formatMessage(messages.updateSuccess))
        : message.error(intl.formatMessage(updateErrorMessage(err)));
    };
    let createOrUpdateUserPromise;
    if (userId) {
      createOrUpdateUserPromise = this._usersService.updateUser(
        userId,
        organisationId,
        formData,
      );
    } else {
      createOrUpdateUserPromise = this._usersService.createUser(
        organisationId,
        formData,
      );
    }

    createOrUpdateUserPromise
      .then(() => {
        redirectAndNotify(null);
      })
      .catch(err => {
        redirectAndNotify(err);
        notifyError(err);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, userId },
      },
    } = this.props;
    const { userData, loading } = this.state;

    const userName = userId
      ? formatMessage(messages.editUser, {
          name: userData.first_name
            ? userData.first_name
            : formatMessage(messages.user),
        })
      : formatMessage(messages.newUser);
    const breadcrumbPaths = [
      <Link key="1" to={`/v2/o/${organisationId}/settings/organisation/users`}>
        {formatMessage(messages.users)}
      </Link>,
      userName,
    ];

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <EditUserForm
        initialValues={userData}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose<Props, {}>(withRouter, injectIntl)(EditUserPage);
