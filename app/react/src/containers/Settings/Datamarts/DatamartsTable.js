import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

import { EmptyTableView, TableView, TableViewFilters } from '../../../components/TableView';
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
      intl: { formatMessage }
    } = this.props;

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalDatamarts,
      onChange: (page) => onFilterChange({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => onFilterChange({
        pageSize: size,
        currentPage: 1
      })
    };

    const dataColumns = [
      {
        intlMessage: messages.datamartId,
        key: 'id',
        isHiddable: false
      },
      {
        intlMessage: messages.datamartToken,
        key: 'token',
        isVisibleByDefault: true,
        isHiddable: true,
      },
      {
        intlMessage: messages.datamartCreationDate,
        key: 'creation_ts',
        isVisibleByDefault: true,
        isHiddable: true,
        render: ts => moment(ts).format('DD/MM/YYYY')
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            intlMessage: messages.editDatamart,
            callback: onEditDatamart
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    const searchOptions = {
      isEnabled: true,
      placeholder: formatMessage(messages.searchPlaceholder),
      onSearch: value => onFilterChange({
        id: value
      }),
      defaultValue: filter.id
    };

    return (noDatamartYet) ? (<EmptyTableView iconType="full-users" text="EMPTY_DATAMARTS" />) :
           (
             <TableViewFilters
               columnsDefinitions={columnsDefinitions}
               searchOptions={searchOptions}
             >
               <TableView
                 columnsDefinitions={columnsDefinitions}
                 dataSource={dataSource}
                 loading={isFetchingDatamarts}
                 pagination={pagination}
               />
             </TableViewFilters>
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
    id: PropTypes.string
  }).isRequired, // eslint-disable-line
  onFilterChange: PropTypes.func.isRequired,
  onEditDatamart: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(DatamartsTable);
