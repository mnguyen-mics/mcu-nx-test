import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Icon, Modal, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView } from '../../../../components/TableView';

import * as AudiencePartitionsActions from '../../../../state/Audience/Partitions/actions';

import {
  AUDIENCE_PARTITIONS_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../../RouteQuerySelector';

import { formatMetric } from '../../../../utils/MetricHelper';

import {
  getTableDataSource
 } from '../../../../state/Audience/Partitions/selectors';

class AudiencePartitionsTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archivePartition = this.archivePartition.bind(this);
    this.editPartition = this.editPartition.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      },
      query,

      loadAudiencePartitionsDataSource
    } = this.props;

    const filter = deserializeQuery(query, AUDIENCE_PARTITIONS_SETTINGS);
    loadAudiencePartitionsDataSource(organisationId, datamartId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      loadAudiencePartitionsDataSource
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId,
        datamartId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, AUDIENCE_PARTITIONS_SETTINGS);
      loadAudiencePartitionsDataSource(organisationId, datamartId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetAudiencePartitionsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, AUDIENCE_PARTITIONS_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      translations,
      isFetchingAudiencePartitions,
      dataSource,
      totalAudiencePartitions
    } = this.props;

    const filter = deserializeQuery(query, AUDIENCE_PARTITIONS_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_AUDIENCE_PARTITIONS,
      onSearch: value => this.updateQueryParams({
        keywords: value
      }),
      defaultValue: filter.keywords
    };


    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAudiencePartitions,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };

    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/datamart/partitions/${record.type}/${record.id}/report`}>{text}</Link>
      },
      {
        translationKey: 'TYPE',
        key: 'type',
        isHiddable: false,
        render: (text) => <span>{text}</span>
      },
      {
        translationKey: 'PART_COUNT',
        key: 'part_count',
        render: (text) => <span>{text}</span>
      },
      {
        translationKey: 'STATUS',
        key: 'status',
        render: text => <span>{text}</span>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editPartition
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archivePartition
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingAudiencePartitions}
      onChange={() => {}}
      searchOptions={searchOptions}
      pagination={pagination}
    />);

  }

  editPartition(partition) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    const editUrl = `/${workspaceId}/datamart/partitions//${partition.id}`;

    router.push(editUrl);
  }

  archivePartition(partition) {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      },
      archiveAudiencePartition,
      loadAudiencePartitionsDataSource,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, AUDIENCE_PARTITIONS_SETTINGS);

    Modal.confirm({
      title: translations.PARTITIONS_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.PARTITIONS_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAudiencePartition(partition.id).then(() => {
          loadAudiencePartitionsDataSource(organisationId, datamartId, filter);
        });
      },
      onCancel() { },
    });
  }

}

AudiencePartitionsTable.defaultProps = {
  archiveAudiencePartition: () => { }
};

AudiencePartitionsTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingAudiencePartitions: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalAudiencePartitions: PropTypes.number.isRequired,

  loadAudiencePartitionsDataSource: PropTypes.func.isRequired,
  archiveAudiencePartition: PropTypes.func.isRequired,
  resetAudiencePartitionsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingAudiencePartitions: state.audiencePartitionsTable.audiencePartitionsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAudiencePartitions: state.audiencePartitionsTable.audiencePartitionsApi.total,
});

const mapDispatchToProps = {
  loadAudiencePartitionsDataSource: AudiencePartitionsActions.fetchAudiencePartitionsList.request,
  archiveAudiencePartition: AudiencePartitionsActions.archiveAudiencePartition,
  resetAudiencePartitionsTable: AudiencePartitionsActions.resetAudiencePartitionsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AudiencePartitionsTable);
