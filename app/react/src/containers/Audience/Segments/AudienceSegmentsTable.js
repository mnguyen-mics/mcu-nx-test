import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Icon, Modal, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView, EmptyTableView } from '../../../components/TableView';

import * as AudienceSegmentsActions from '../../../state/Audience/Segments/actions';

import {
  AUDIENCE_SEGMENTS_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../RouteQuerySelector';

import { formatMetric } from '../../../utils/MetricHelper';

import {
  getTableDataSource
 } from '../../../state/Audience/Segments/selectors';

class AudienceSegmentsTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveSegment = this.archiveSegment.bind(this);
    this.editSegment = this.editSegment.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      },
      query,

      loadAudienceSegmentsDataSource
    } = this.props;

    const filter = deserializeQuery(query, AUDIENCE_SEGMENTS_SETTINGS);
    loadAudienceSegmentsDataSource(organisationId, datamartId, filter, true);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      loadAudienceSegmentsDataSource
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
      const filter = deserializeQuery(nextQuery, AUDIENCE_SEGMENTS_SETTINGS);
      loadAudienceSegmentsDataSource(organisationId, datamartId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetAudienceSegmentsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, AUDIENCE_SEGMENTS_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      translations,
      isFetchingAudienceSegments,
      isFetchingSegmentsStat,
      dataSource,
      totalAudienceSegments,
      hasAudienceSegments
    } = this.props;

    const filter = deserializeQuery(query, AUDIENCE_SEGMENTS_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_AUDIENCE_SEGMENTS,
      onSearch: value => this.updateQueryParams({
        keywords: value
      }),
      defaultValue: filter.keywords
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateQueryParams({
        rangeType: values.rangeType,
        lookbackWindow: values.lookbackWindow,
        from: values.from,
        to: values.to,
      }),
      values: {
        rangeType: filter.rangeType,
        lookbackWindow: filter.lookbackWindow,
        from: filter.from,
        to: filter.to
      }
    };

    const columnsVisibilityOptions = {
      isEnabled: true
    };

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAudienceSegments,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingSegmentsStat) {
        return (<i className="mcs-loading" />); // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'TYPE',
        key: 'type',
        isHiddable: false,
        render: (text) => {
          switch (text) {
            case 'USER_ACTIVATION':
              return (<Tooltip placement="top" title={translations[text]}><Icon type="rocket" /></Tooltip>);
            case 'USER_QUERY':
              return (<Tooltip placement="top" title={translations[text]}><Icon type="database" /></Tooltip>);
            case 'USER_LIST':
              return (<Tooltip placement="top" title={translations[text]}><Icon type="solution" /></Tooltip>);
            default:
              return (<Tooltip placement="top" title={translations[text]}><Icon type="database" /></Tooltip>);
          }
        }
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/datamart/segments/${record.type}/${record.id}/report`}>{text}</Link>
      },
      {
        translationKey: 'TECHNICAL_NAME',
        isVisibleByDefault: false,
        key: 'technical_name',
        isHiddable: true,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/datamart/segments/${record.type}/${record.id}/report`}>{text}</Link>
      },
      {
        translationKey: 'USER_POINTS',
        key: 'user_points',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'USER_ACCOUNTS',
        key: 'user_accounts',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'EMAILS',
        key: 'emails',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'COOKIES',
        key: 'desktop_cookie_ids',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'ADDITION',
        key: 'user_point_additions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'DELETION',
        key: 'user_point_deletions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editSegment
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveSegment
          }
        ]
      }
    ];

    const typeItems = ['USER_ACTIVATION', 'USER_LIST', 'USER_QUERY'].map(type => ({ key: type, value: type }));

    const filtersOptions = [
      {
        name: 'types',
        displayElement: (<div><FormattedMessage id="TYPE" /> <Icon type="down" /></div>),
        menuItems: {
          handleMenuClick: value => this.updateQueryParams({ types: value.types.map(item => item.value) }),
          selectedItems: filter.types.map(type => ({ key: type, value: type })),
          items: typeItems
        }
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (hasAudienceSegments) ? (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingAudienceSegments}
      onChange={() => {}}
      searchOptions={searchOptions}
      dateRangePickerOptions={dateRangePickerOptions}
      filtersOptions={filtersOptions}
      columnsVisibilityOptions={columnsVisibilityOptions}
      pagination={pagination}
    />) : (<EmptyTableView icon="users" text="EMPTY_SEGMENTS" />);

  }

  editSegment(segment) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    const editUrl = `/${workspaceId}/datamart/segments//${segment.id}`;

    router.push(editUrl);
  }

  archiveSegment(segment) {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      },
      archiveAudienceSegment,
      loadAudienceSegmentsDataSource,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, AUDIENCE_SEGMENTS_SETTINGS);

    Modal.confirm({
      title: translations.SEGMENT_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.SEGMENT_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAudienceSegment(segment.id).then(() => {
          loadAudienceSegmentsDataSource(organisationId, datamartId, filter);
        });
      },
      onCancel() { },
    });
  }

}

AudienceSegmentsTable.defaultProps = {
  archiveAudienceSegment: () => { }
};

AudienceSegmentsTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  hasAudienceSegments: PropTypes.bool.isRequired,
  isFetchingAudienceSegments: PropTypes.bool.isRequired,
  isFetchingSegmentsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalAudienceSegments: PropTypes.number.isRequired,

  loadAudienceSegmentsDataSource: PropTypes.func.isRequired,
  archiveAudienceSegment: PropTypes.func.isRequired,
  resetAudienceSegmentsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  hasAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.hasItems,
  isFetchingAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.isFetching,
  isFetchingSegmentsStat: state.audienceSegmentsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.total,
});

const mapDispatchToProps = {
  loadAudienceSegmentsDataSource: AudienceSegmentsActions.loadAudienceSegmentsDataSource,
  archiveAudienceSegment: AudienceSegmentsActions.archiveAudienceSegment,
  resetAudienceSegmentsTable: AudienceSegmentsActions.resetAudienceSegmentsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AudienceSegmentsTable);
