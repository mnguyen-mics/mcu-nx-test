import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import lodash from 'lodash';

import { TableView, TableViewFilters, EmptyTableView } from '../../../../components/TableView';
import * as AudiencePartitionsActions from '../../../../state/Audience/Partitions/actions';

import { PARTITIONS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../state/Audience/Partitions/selectors';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

class AudiencePartitionsTable extends Component {

  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archivePartition = this.archivePartition.bind(this);
    this.editPartition = this.editPartition.bind(this);
  }

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          organisationId,
        },
      },
      loadAudiencePartitionsDataSource,
    } = this.props;

    if (!isSearchValid(search, this.getSearchSetting(organisationId))) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, this.getSearchSetting(organisationId)),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, this.getSearchSetting(organisationId));
      const datamartId = filter.datamarts[0];

      loadAudiencePartitionsDataSource(organisationId, datamartId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
      history,
      loadAudiencePartitionsDataSource,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, this.getSearchSetting(nextOrganisationId))) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, this.getSearchSetting(nextOrganisationId)),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, this.getSearchSetting(nextOrganisationId));
        const datamartId = filter.datamarts[0];

        loadAudiencePartitionsDataSource(nextOrganisationId, datamartId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAudiencePartitionsTable();
  }

  archivePartition = (partition) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      archiveAudiencePartition,
      loadAudiencePartitionsDataSource,
      translations,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    Modal.confirm({
      title: translations.PARTITIONS_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.PARTITIONS_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAudiencePartition(partition.id).then(() => {
          const datamartId = filter.datamarts[0];
          loadAudiencePartitionsDataSource(organisationId, datamartId, filter);
        });
      },
      onCancel() { },
    });
  }

  editPartition = (partition) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    const editUrl = `/o${organisationId}d${partition.datamart_id}/datamart/partitions//${partition.id}`;

    history.push(editUrl);
  }

  getSearchSetting(organisationId) {
    const { defaultDatamart } = this.props;

    return [
      ...PARTITIONS_SEARCH_SETTINGS,
      {
        paramName: 'datamarts',
        defaultValue: [parseInt(defaultDatamart(organisationId).id, 0)],
        deserialize: query => {
          if (query.datamarts) {
            return query.datamarts.split(',').map((d) => parseInt(d, 0));
          }
          return [];
        },
        serialize: value => value.join(','),
        isValid: query =>
        query.datamarts &&
        query.datamarts.split(',').length > 0 &&
        lodash.every(query.datamarts, (d) => !isNaN(parseInt(d, 0))),
      },
    ];
  }

  updateLocationSearch = (params) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
      location: {
        search: currentSearch,
        pathname,
      },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, this.getSearchSetting(organisationId)),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      translations,
      isFetchingAudiencePartitions,
      dataSource,
      totalAudiencePartitions,
      hasAudiencePartitions,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_AUDIENCE_PARTITIONS,
      onSearch: value => this.updateLocationSearch({
        keywords: value,
      }),
      defaultValue: filter.keywords,
    };

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAudiencePartitions,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page,
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        pageSize: size,
      }),
    };

    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/o${organisationId}d${record.datamart_id}/datamart/partitions/${record.type}/${record.id}/report`}
          >{text}
          </Link>
        ),
      },
      {
        translationKey: 'TYPE',
        key: 'type',
        isHideable: false,
        render: (text) => <span>{text}</span>,
      },
      {
        translationKey: 'PART_COUNT',
        key: 'part_count',
        render: (text) => <span>{text}</span>,
      },
      {
        translationKey: 'STATUS',
        key: 'status',
        render: text => <span>{text}</span>,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editPartition,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archivePartition,
          },
        ],
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return (hasAudiencePartitions
      ? (
        <div className="mcs-table-container">
          <TableViewFilters
            columnsDefinitions={columnsDefinitions}
            searchOptions={searchOptions}
          >
            <TableView
              columnsDefinitions={columnsDefinitions}
              dataSource={dataSource}
              loading={isFetchingAudiencePartitions}
              pagination={pagination}
            />
          </TableViewFilters>
        </div>
      )
      : <EmptyTableView iconType="partitions" text="EMPTY_PARTITIONS" />
    );
  }
}

AudiencePartitionsTable.defaultProps = {
  archiveAudiencePartition: () => { },
};

AudiencePartitionsTable.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  isFetchingAudiencePartitions: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalAudiencePartitions: PropTypes.number.isRequired,

  defaultDatamart: PropTypes.func.isRequired,
  hasAudiencePartitions: PropTypes.bool.isRequired,
  loadAudiencePartitionsDataSource: PropTypes.func.isRequired,
  archiveAudiencePartition: PropTypes.func.isRequired,
  resetAudiencePartitionsTable: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasAudiencePartitions: state.audiencePartitionsTable.audiencePartitionsApi.hasItems,
  isFetchingAudiencePartitions: state.audiencePartitionsTable.audiencePartitionsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAudiencePartitions: state.audiencePartitionsTable.audiencePartitionsApi.total,
  defaultDatamart: getDefaultDatamart(state),
});

const mapDispatchToProps = {
  loadAudiencePartitionsDataSource: AudiencePartitionsActions.fetchAudiencePartitionsList.request,
  archiveAudiencePartition: AudiencePartitionsActions.archiveAudiencePartition,
  resetAudiencePartitionsTable: AudiencePartitionsActions.resetAudiencePartitionsTable,
};

AudiencePartitionsTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AudiencePartitionsTable);

AudiencePartitionsTable = withRouter(AudiencePartitionsTable);

export default AudiencePartitionsTable;
