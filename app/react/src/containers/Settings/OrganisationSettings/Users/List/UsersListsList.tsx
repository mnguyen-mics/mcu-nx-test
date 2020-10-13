import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout, Button } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import UserResource from '../../../../../models/directory/UserResource';
import { messages } from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { Link } from 'react-router-dom';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { ICommunityService } from '../../../../../services/CommunityServices';

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

class UserListsList extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  UserListState
> {
  state = initialState;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  @lazyInject(TYPES.ICommunityService)
  private _communityService: ICommunityService

  archiveUser = (recommenderId: string) => {
    return Promise.resolve();
  };

  fetchUsers = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._organisationService.getOrganisation(organisationId)
        .then(response => 
          this._communityService.getCommunityUsers(response.data.community_id, options))
        .then(
          (results: { data: UserResource[]; total?: number; count: number }) => {
            this.setState({
              loading: false,
              data: results.data,
              total: results.total || results.count,
            });
          }
        );
    });
  };

  onClickEdit = (user: UserResource) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/organisation/users/${user.id}/edit`,
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: () => [{ intlMessage: messages.editUser, callback: this.onClickEdit }],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.usersFirstName,
        key: 'first_name',
        isHideable: false,
        render: (text: string, record: UserResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/organisation/users/${
              record.id
            }/edit`}
          >
            {text} {record.last_name}
          </Link>
        ),
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
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.emptyUsers),
    };

    const onClick = () =>
      this.props.history.push(
        `/v2/o/${organisationId}/settings/organisation/users/create`,
      );

    const buttons = (
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newUser} />
      </Button>
    );

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.users} />
          </span>
          <span className="mcs-card-button">{buttons}</span>
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

export default compose(withRouter, injectIntl)(UserListsList);
