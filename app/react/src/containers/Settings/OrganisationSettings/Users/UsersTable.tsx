import React from 'react';
import { injectIntl } from 'react-intl';

import {
  EmptyTableView,
  TableView,
} from '../../../../components/TableView/index';

import messages from './messages';
import { User } from '../../../../models/settings/settings';
import { compose } from 'recompose';

export interface Filters {
  currentPage?: number;
  pageSize?: number;
}

interface UsersTableProps {
  isFetchingUsers: boolean;
  dataSource: User[];
  totalUsers: number;
  noUserYet: boolean;
  onFilterChange: (a: Filters) => void;
  // onUserEdit: (a: User) => void;
  // onUserArchive: (a: User) => void;
  filter: Filters;
}

class UsersTable extends React.Component<UsersTableProps, any> {
  render() {
    const {
      isFetchingUsers,
      dataSource,
      totalUsers,
      noUserYet,
      onFilterChange,
      // onUserEdit,
      // onUserArchive,
      filter,
    } = this.props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalUsers,
      onChange: (current: number, size: number) =>
        onFilterChange({
          currentPage: current,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messages.usersName,
        key: 'first_name',
        isVisibleByDefault: true,
        isHideable: true,
        render: (firstName: string, record: User) =>
          `${firstName} ${record.last_name}`,
      },
      {
        intlMessage: messages.usersEmail,
        key: 'email',
        isVisibleByDefault: true,
        isHideable: true,
      },
    ];

    // const actionColumns = [
    //   {
    //     key: 'action',
    //     actions: [
    //       {
    //         intlMessage: messages.editUser,
    //         callback: onUserEdit,
    //       },
    //       {
    //         intlMessage: messages.archiveUser,
    //         callback: onUserArchive,
    //       },
    //     ],
    //   },
    // ];

    return noUserYet ? (
      <EmptyTableView iconType="full-users" intlMessage={messages.emptyUsers} />
    ) : (
      <TableView
        // actionsColumnsDefinition={actionColumns}
        columns={dataColumns}
        dataSource={dataSource}
        loading={isFetchingUsers}
        pagination={pagination}
      />
    );
  }
}

export default compose<UsersTableProps, UsersTableProps>(injectIntl)(UsersTable);
