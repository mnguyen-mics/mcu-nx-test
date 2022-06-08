import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout, Button } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import UserResource from '../../../../../models/directory/UserResource';
import { messages } from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { Link } from 'react-router-dom';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { ICommunityService } from '../../../../../services/CommunityServices';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { IUsersService } from '../../../../../services/UsersService';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface UserListState {
  loading: boolean;
  data: UserResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedNotificationProps;

class OldUserListPage extends React.Component<Props, UserListState> {
  state = initialState;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  @lazyInject(TYPES.ICommunityService)
  private _communityService: ICommunityService;

  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;

  archiveUser = (recommenderId: string) => {
    return Promise.resolve();
  };

  fetchUsers = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._organisationService
        .getOrganisation(organisationId)
        .then(response =>
          this._communityService.getCommunityUsers(response.data.community_id, options),
        )
        .then((results: { data: UserResource[]; total?: number; count: number }) => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  };

  onClickEdit = (user: UserResource) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/organisation/users/${user.id}/edit`);
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
        search: updateSearch(currentSearch, computedFilter, PAGINATION_SEARCH_SETTINGS),
      };

      history.push(nextLocation);
    } else {
      this.fetchUsers(organisationId, filter);
    }
  };

  onClickDelete = (user: UserResource) => {
    const { notifyError } = this.props;

    this._usersService
      .deleteUser(user.id, user.organisation_id)
      .then(this.redirect)
      .catch(err => {
        notifyError(err);
      });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<UserResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.editUser),
            callback: this.onClickEdit,
          },
          {
            message: formatMessage(messages.deleteUser),
            callback: this.onClickDelete,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<UserResource>> = [
      {
        title: formatMessage(messages.usersName),
        key: 'first_name',
        isHideable: false,
        render: (text: string, record: UserResource) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/settings/organisation/users/${record.id}/edit`}
          >
            {text} {record.last_name}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.usersEmail),
        key: 'email',
        isHideable: false,
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.emptyUsers),
    };

    const onClick = () =>
      this.props.history.push(`/v2/o/${organisationId}/settings/organisation/users/create`);

    const buttons = (
      <Button key='create' type='primary' onClick={onClick}>
        <FormattedMessage {...messages.newUser} />
      </Button>
    );

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.users} />
          </span>
          <span className='mcs-card-button'>{buttons}</span>
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
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

export default compose<Props, {}>(withRouter, injectIntl, injectNotifications)(OldUserListPage);
