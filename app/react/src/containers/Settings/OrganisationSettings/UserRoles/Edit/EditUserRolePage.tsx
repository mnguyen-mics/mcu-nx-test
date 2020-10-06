import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { Loading } from '../../../../../components/index';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IUsersService } from '../../../../../services/UsersService';
import EditUserRoleForm from './EditUserRoleForm';
import UserRoleResource from '../../../../../models/directory/UserRoleResource';
import { IUserRolesService } from '../../../../../services/UserRolesService';
import { notifyError } from '../../../../../redux/Notifications/actions';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { message } from 'antd';

const messages = defineMessages({
  newUserRole: {
    id: 'settings.organisation.usersRoles.edit.newUserRole',
    defaultMessage: 'New User Role',
  },
  userRoles: {
    id: 'settings.organisation.usersRoles.edit.userRoles',
    defaultMessage: 'User Roles',
  },
  userRole: {
    id: 'settings.organisation.usersRoles.edit.userRole',
    defaultMessage: 'User Role',
  },
  editUserRole: {
    id: 'settings.organisation.usersRoles.edit.editRole',
    defaultMessage: 'Edit role',
  },
  savingInProgress: {
    id: 'settings.organisation.usersRoles.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
  updateSuccess: {
    id: 'settings.organisation.usersRoles.edit.userRoleSuccessfullySaved',
    defaultMessage: 'User role successfully saved ',
  },
  updateError: {
    id: 'settings.organisation.usersRoles.edit.userRoleUpdateFailed',
    defaultMessage: 'User role update failed ',
  },
});

interface UserRoleExtended extends UserRoleResource {
  user_id: string
  user_name: string;
  organisation_name: string;
  email: string;
}

const INITIAL_USER_ROLE_FORM_DATA: Partial<UserRoleExtended> = {
  user_name: '',
  email: '',
  organisation_name: '',
}

interface State {
  loading: boolean;
  userRoleData: Partial<UserRoleExtended>;
}

type Props = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; userId: string, roleId: string }>;

class EditUserPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;

  @lazyInject(TYPES.IUserRolesService)
  private _userRolesService: IUserRolesService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      userRoleData: INITIAL_USER_ROLE_FORM_DATA,
    };
  }

  
  componentDidMount() {
    const {
      match: {
        params: { userId, roleId },
      },
    } = this.props;
    if (userId && roleId) {
      this.setState({loading: true});
      this._userRolesService.getUserRoles(userId)
      .then(response => {
        return response.data.find((role: UserRoleResource) => role.id === roleId)
      })
      .then(role => {
        if (role) {
          this._usersService
            .getUser(userId, role.organisation_id)
            .then(resp => {
              const userWithRole: UserRoleExtended = {
                ...role,
                user_id: resp.data.id,
                user_name: `${resp.data.first_name} ${resp.data.last_name}`,
                email: resp.data.email,
                organisation_name: "",
              }
              this.setState({
                userRoleData: userWithRole,
              });
              this._organisationService.getOrganisation(role.organisation_id)
              .then(orgRessource => 
                this.setState({
                  userRoleData: {
                    ...this.state.userRoleData,
                    organisation_name: orgRessource.data.name,
                  },
                  loading: false,
                })
              )
            })
            .catch(err => {
              this.redirectAndNotify(false);
              notifyError(err);
            })
        }
        else {
          notifyError("UserRole not found");
          this.setState({loading: false});
        }
      })
      .catch(err => {
        this.redirectAndNotify(false);
        notifyError(err);
      })
    }
  }

  close = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/settings/organisation/user_roles`;

    return history.push(url);
  };

  redirectAndNotify(success: boolean = false) {
    const {
      intl,
    } = this.props;

    this.setState({
      loading: false,
    });

    this.close();
    success
      ? message.success(intl.formatMessage(messages.updateSuccess))
      : message.error(intl.formatMessage(messages.updateError));
  };

  save = (formData: UserRoleExtended) => {
    const {
      match: {
        params: { userId },
      },
    } = this.props;
    this.setState({
      loading: true,
    });    

    const newRole: UserRoleResource = {
      organisation_id: formData.organisation_id,
      role: formData.role,
    };

    if (formData.id) {
      this._userRolesService.deleteUserRole(userId, formData.id)
      .then( _ => 
        this._userRolesService.createUserRole(userId, newRole)
      )
      .then(() => {
        this.redirectAndNotify(true);
      })
      .catch(err => {
        this.redirectAndNotify();
        notifyError(err);
      })

    }

  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { userRoleData, loading } = this.state;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.userRoles),
        path: `/v2/o/${organisationId}/settings/organisation/user_roles`,
      },
      {
        name: formatMessage(messages.editUserRole),
      },
    ];

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <EditUserRoleForm
        initialValues={userRoleData}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose<Props, {}>(withRouter, injectIntl)(EditUserPage);
