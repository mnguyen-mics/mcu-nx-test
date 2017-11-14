import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import moment from 'moment';

import { EmptyTableView, TableView } from '../../../components/TableView/index.ts';
import messages from './messages';

class DatamartsTable extends Component {

  render() {
    const {
      isFetchingDatamarts,
      dataSource,
      totalDatamarts,
      noDatamartYet,
      onFilterChange,
      onEditDatamart,
      filter,
    } = this.props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalDatamarts,
      onChange: (page) => onFilterChange({
        currentPage: page,
      }),
      onShowSizeChange: (current, size) => onFilterChange({
        pageSize: size,
        currentPage: 1,
      }),
    };

    const dataColumns = [
      {
        intlMessage: messages.datamartId,
        key: 'id',
        isHideable: false,
      },
      {
        intlMessage: messages.datamartToken,
        key: 'token',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.datamartCreationDate,
        key: 'creation_ts',
        isVisibleByDefault: true,
        isHideable: true,
        render: ts => moment(ts).format('DD/MM/YYYY'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            intlMessage: messages.editDatamart,
            callback: onEditDatamart,
          },
        ],
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return (noDatamartYet) ? (<EmptyTableView iconType="full-users" intlMessage={messages.emptyDatamarts} />) :
           (
             <TableView
               columnsDefinitions={columnsDefinitions}
               dataSource={dataSource}
               loading={isFetchingDatamarts}
               pagination={pagination}
             />
           );
  }
}

DatamartsTable.propTypes = {
  noDatamartYet: PropTypes.bool.isRequired,
  isFetchingDatamarts: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalDatamarts: PropTypes.number.isRequired,
  filter: PropTypes.shape({
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    id: PropTypes.string,
  }).isRequired, // eslint-disable-line
  onFilterChange: PropTypes.func.isRequired,
  onEditDatamart: PropTypes.func.isRequired,
};

export default injectIntl(DatamartsTable);
