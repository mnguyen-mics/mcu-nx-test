import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Button, Layout } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import UsersService from '../../../../../services/UsersService';
import {
  PAGINATION_SEARCH_SETTINGS,
  // parseSearch,
  // updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { User } from '../../../../../models/settings/settings';
import messages from './messages';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface UserListState {
  loading: boolean;
  data: User[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class UserList extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  UserListState
> {
  state = initialState;

  archiveUser = (recommenderId: string) => {
    return Promise.resolve();
  };

  fetchUsers = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      UsersService.getUsers(organisationId, options).then(
        (results: { data: User[]; total?: number; count: number }) => {
          
            this.setState({
              loading: false,
              data: results.data,
              total: results.total || results.count,
            });
          }
        );
      })
  };

  // onClickArchive = (user: User) => {
  //   const {
  //     location: { search, pathname, state },
  //     history,
  //     match: { params: { organisationId } },
  //     intl: { formatMessage },
  //   } = this.props;

  //   const { data } = this.state;

  //   const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

  //   Modal.confirm({
  //     iconType: 'exclamation-circle',
  //     title: formatMessage(messages.recommenderArchiveTitle),
  //     content: formatMessage(messages.recommenderArchiveMessage),
  //     okText: formatMessage(messages.recommenderArchiveOk),
  //     cancelText: formatMessage(messages.recommenderArchiveCancel),
  //     onOk: () => {
  //       this.archiveUser(user.id).then(() => {
  //         if (data.length === 1 && filter.currentPage !== 1) {
  //           const newFilter = {
  //             ...filter,
  //             currentPage: filter.currentPage - 1,
  //           };
  //           history.replace({
  //             pathname: pathname,
  //             search: updateSearch(search, newFilter),
  //             state: state,
  //           });
  //           return Promise.resolve();
  //         }
  //         return this.fetchUsers(organisationId, filter);
  //       });
  //     },
  //     onCancel: () => {
  //       // cancel
  //     },
  //   });
  // };

  onClickEdit = (user: User) => {
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/organisation/users/${user.id}/edit`,
    );
  };

  render() {
    const { match: { params: { organisationId } }, history } = this.props;

    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: [
          { translationKey: 'EDIT', callback: this.onClickEdit },
          // { translationKey: 'ARCHIVE', callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.usersName,
        key: 'first_name',
        isHideable: false,
        render: (text: string, record: User) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/organisation/users/${
              record.id
            }/edit`}
          >
            {text}{' '}{record.last_name}
          </Link>
        ),
      },
      {
        intlMessage: messages.usersEmail,
        key: 'email',
        isHideable: false,
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.emptyUsers,
    };

    const onClick = () => history.push(`/v2/o/${organisationId}/settings/campaigns/recommenders/create`)

    const buttons = [
      (<Button key="create" type="primary" onClick={onClick}>
      <FormattedMessage {...messages.newUser} />
    </Button>)
    ]

    const additionnalComponent = (<div>
      <div className="mcs-card-header mcs-card-title">
        <span className="mcs-card-title"><FormattedMessage {...messages.users} /></span>
        <span className="mcs-card-button">{buttons}</span>
      </div>
      <hr className="mcs-separator" />
    </div>)

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

export default compose(withRouter, injectIntl)(UserList);
