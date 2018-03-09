import React, { Component } from 'react';
import { compose } from 'recompose';
import { Button, Row } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';

import UsersService from '../../../../services/UsersService';

import messages from './messages';

import UsersTable, { Filters } from './UsersTable';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { withRouter, RouteComponentProps } from 'react-router';
import { User } from '../../../../models/settings/settings';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';


interface UsersListProps {
}

interface UsersListState {
  totalUsers: number;
  isCreatingUsers: boolean;
  isFetchingUsers: boolean;
  modalVisible: boolean;
  hasUsers: boolean;
  filter: Filters;
  inputValue: string;
  selectedUserId: string;
  hasError: boolean;
  edition: boolean;
  users: User[];
}

type Props = UsersListProps & RouteComponentProps<{ organisationId: string }> & InjectedNotificationProps;

class UsersListPage extends Component<Props, UsersListState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      totalUsers: 0,
      isFetchingUsers: true,
      isCreatingUsers: false,
      modalVisible: false,
      hasUsers: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
      },
      inputValue: '',
      selectedUserId: '',
      hasError: false,
      edition: false,
      users: []
    };
  }

  componentDidMount() {
    const {
        match: {
            params: {
                organisationId
            }
        }
    } = this.props;
    this.fetchUsers(organisationId, this.state.filter)
  }

  fetchUsers = (organisationId: string, filter: Filters) => {
    const buildUsersOptions = () => {
      return {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
    };
    this.setState({ isFetchingUsers: true }, () => {
        UsersService.getUsers(organisationId, buildUsersOptions())
            .then(res => {
                this.setState({
                    isFetchingUsers: false,
                    hasUsers: res && res.total === 0,
                    users: res.data,
                    totalUsers: res.total ? res.total : res.count,
                })
            })
            .catch(error => {
                this.setState({ isFetchingUsers: false });
                this.props.notifyError(error);
              });
    })
  }

  // handleEditUsers = (users: User) => {
  //   console.log(users)
  // }

  // handleArchiveUsers = (label: User, that: UsersListPage) => {
  //   Modal.confirm({
  //     title: 'Do you Want to delete these items?',
  //     content: 'Some descriptions',
  //     onOk() {
  //       console.log('ok')
  //     },
  //     onCancel() {
  //       // cancel
  //     },
  //   });
  // }

  buildNewActionElement = () => {
    const onClick = () => {
      this.setState({ modalVisible: true, inputValue: '', selectedUserId: '' });
    };
    return (
      <Button
        key="new"
        type="primary"
        htmlType="submit"
        onClick={onClick}
      >
        <FormattedMessage {...messages.newUser} />
      </Button>
    );
  }

 

  handleFilterChange = (newFilter: Filters) => {
    const {
        match: {
          params: {
            organisationId
          }
        },
      } = this.props;
    this.setState({ filter: newFilter });
    this.fetchUsers(organisationId, newFilter)
  }
 

  render() {
    const {
      totalUsers,
      hasUsers,
      filter,
      isFetchingUsers,
      users,
    } = this.state;

    // const newButton = this.buildNewActionElement();
    // const buttons = [newButton];

    // const onUserArchive = (label: User) => { this.handleArchiveUsers(label, this); };

    return (
      <Row className="mcs-table-container">
        <div>
          <div className="mcs-card-header mcs-card-title">
            <span className="mcs-card-title"><FormattedMessage {...messages.users} /></span>
            {/* <span className="mcs-card-button">{buttons}</span> */}
          </div>
          <hr className="mcs-separator" />
          <UsersTable
            dataSource={users}
            totalUsers={totalUsers}
            isFetchingUsers={isFetchingUsers}
            noUserYet={hasUsers}
            filter={filter}
            onFilterChange={this.handleFilterChange}
            // onUserArchive={onUserArchive}
            // onUserEdit={this.handleEditUsers}
          />
        
        </div>
      </Row>
    );
  }
}

export default compose<Props, UsersListProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(UsersListPage);
