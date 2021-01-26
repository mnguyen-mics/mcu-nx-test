import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import {
  PAGINATION_SEARCH_SETTINGS,
  updateSearch,
  parseSearch
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { messages } from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IUsersService } from '../../../../../services/UsersService';
import { UserWithRole } from '../domain';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { OrganisationResource } from '../../../../../models/organisation/organisation';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { IUserRolesService } from '../../../../../services/UserRolesService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
  communityId: '0',
  communityOrgs: [] as OrganisationResource[],
};

interface UserListState {
  loading: boolean;
  data: UserWithRole[];
  total: number;
  communityId: string;
  communityOrgs: OrganisationResource[];
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class UserRolesList extends React.Component<Props, UserListState> {
  state = initialState;

  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  @lazyInject(TYPES.IUserRolesService)
  private _userRolesService: IUserRolesService;

  fetchUsers = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._organisationService
        .getOrganisation(organisationId)
        .then(response => {
          this.setState({ communityId: response.data.community_id });
          this._usersService
            .getUsersWithUserRole(response.data.community_id, options)
            .then(
              (results: {
                data: UserWithRole[];
                total?: number;
                count: number;
              }) => {
                this.setState({
                  loading: false,
                  data: results.data,
                  total: results.total || results.count,
                });
                this._organisationService
                  .getOrganisations(this.state.communityId)
                  .then(organisationsResponse =>
                    this.setState({
                      communityOrgs: organisationsResponse.data,
                    }),
                  );
              },
            );
        });
    });
  };

  onClickEdit = (user: UserWithRole) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/organisation/user_roles/${user.role.id}/user/${user.id}/edit`,
    );
  };

  redirect = () => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search: currentSearch, pathname },
      history,
    } = this.props;
    const { data } = this.state;

    const filter = parseSearch(currentSearch, PAGINATION_SEARCH_SETTINGS);

    if (data.length === 1 && filter.currentPage !== 1) {
      const computedFilter = {
        ...filter,
        currentPage: filter.currentPage - 1,
      };

      const nextLocation = {
        pathname,
        search: updateSearch(
          currentSearch,
          computedFilter,
          PAGINATION_SEARCH_SETTINGS,
        ),
      };

      history.push(nextLocation);
    } else {
      this.fetchUsers(organisationId, filter);
    }
  };

  onClickDelete = (user: UserWithRole) => {
    const { notifyError } = this.props;
    if (user.role.id) {
      this._userRolesService
        .deleteUserRole(user.id, user.role.id)
        .then(this.redirect)
        .catch(err => {
          notifyError(err);
        });
    }
  };

  render() {
    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: () => [
          { intlMessage: messages.editUserRole, callback: this.onClickEdit },
          {
            intlMessage: messages.deleteUserRole,
            callback: this.onClickDelete,
          },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.usersFirstName,
        key: 'first_name',
        isHideable: false,
      },
      {
        intlMessage: messages.usersLastName,
        key: 'last_name',
        isHideable: false,
      },
      {
        intlMessage: messages.usersEmail,
        key: 'email',
        isHideable: false,
      },
      {
        intlMessage: messages.roleOrg,
        key: 'role.organisation_id',
        isHideable: false,
        render: (text: string) => {
          const organisation:
            | OrganisationResource
            | undefined = this.state.communityOrgs.find(
            (org: OrganisationResource) => org.id === text,
          );
          return organisation ? organisation.name : text;
        },
      },
      {
        intlMessage: messages.roleTitle,
        key: 'role.role',
        isHideable: false,
        render: (text: string) =>
          text.charAt(0) +
          text
            .slice(1)
            .toLowerCase()
            .replace('_', ' '),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.emptyUsers),
    };

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.userRoles} />
          </span>
        </div>
        <hr className="mcs-separator" />
      </div>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <ItemList
            fetchList={this.fetchUsers}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
          />
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
)(UserRolesList);
