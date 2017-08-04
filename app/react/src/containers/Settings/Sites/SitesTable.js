import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

import { EmptyTableView, TableView, TableViewFilters } from '../../../components/TableView';
import messages from './messages';

class SitesTable extends Component {

  render() {
    const {
      isFetchingSites,
      dataSource,
      totalSites,
      noSiteYet,
      onFilterChange,
      onArchiveSite,
      onEditSite,
      filter,
      intl: { formatMessage }
    } = this.props;

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalSites,
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
        intlMessage: messages.siteName,
        key: 'name',
        isHiddable: false
      },
      {
        intlMessage: messages.siteToken,
        key: 'token',
        isVisibleByDefault: true,
        isHiddable: true,
      },
      {
        intlMessage: messages.siteCreationDate,
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
            intlMessage: messages.editSite,
            callback: onEditSite
          }, {
            intlMessage: messages.archiveSite,
            callback: onArchiveSite
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
        name: value
      }),
      defaultValue: filter.name
    };

    return (noSiteYet) ? (<EmptyTableView iconType="bolt" intlMessage={messages.emptySites} />) :
           (
             <TableViewFilters
               columnsDefinitions={columnsDefinitions}
               searchOptions={searchOptions}
             >
               <TableView
                 columnsDefinitions={columnsDefinitions}
                 dataSource={dataSource}
                 loading={isFetchingSites}
                 pagination={pagination}
               />
             </TableViewFilters>
           );
  }
}

SitesTable.propTypes = {
  noSiteYet: PropTypes.bool.isRequired,
  isFetchingSites: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalSites: PropTypes.number.isRequired,
  filter: PropTypes.shape({
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    name: PropTypes.string
  }).isRequired, // eslint-disable-line
  onFilterChange: PropTypes.func.isRequired,
  onArchiveSite: PropTypes.func.isRequired,
  onEditSite: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(SitesTable);
