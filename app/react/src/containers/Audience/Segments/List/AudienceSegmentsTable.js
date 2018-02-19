import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
import { FormattedMessage, defineMessages } from 'react-intl';
import lodash from 'lodash';

import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index.ts';
import * as AudienceSegmentsActions from '../../../../state/Audience/Segments/actions';

import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper.ts';
import { getTableDataSource } from '../../../../state/Audience/Segments/selectors';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

const messages = defineMessages({
  filterByLabel: {
    id: 'audience.label.filterBy',
    defaultMessage: 'Filter By Label'
  }
});

class AudienceSegmentsTable extends Component {

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
      loadAudienceSegmentsDataSource,
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
      loadAudienceSegmentsDataSource(organisationId, datamartId, filter, true);
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
      loadAudienceSegmentsDataSource,
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
        loadAudienceSegmentsDataSource(nextOrganisationId, datamartId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAudienceSegmentsTable();
  }

  archiveSegment = (segment) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      archiveAudienceSegment,
      loadAudienceSegmentsDataSource,
      translations,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting());

    Modal.confirm({
      title: translations.SEGMENT_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.SEGMENT_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAudienceSegment(segment.id).then(() => {
          const datamartId = filter.datamarts[0];
          loadAudienceSegmentsDataSource(organisationId, datamartId, filter);
        });
      },
      onCancel() { },
    });
  }

  editSegment = (segment) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    const editUrl = segment.type === 'USER_LIST' ? `/v2/o/${organisationId}/audience/segments/${segment.id}/edit` : `/o${organisationId}d${segment.datamart_id}/datamart/segments/${segment.type}/${segment.id}`;

    history.push(editUrl);
  }

  getSearchSetting(organisationId) {
    const { defaultDatamart } = this.props;

    return [
      ...SEGMENTS_SEARCH_SETTINGS,
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
      isFetchingAudienceSegments,
      isFetchingSegmentsStat,
      dataSource,
      totalAudienceSegments,
      hasAudienceSegments,
      labels,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    const searchOptions = {
      placeholder: translations.SEARCH_AUDIENCE_SEGMENTS,
      onSearch: value => this.updateLocationSearch({
        keywords: value,
      }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateLocationSearch({
        from: values.from,
        to: values.to,
      }),
      values: {
        from: filter.from,
        to: filter.to,
      },
    };

    const columnsVisibilityOptions = {
      isEnabled: true,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAudienceSegments,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page,
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        currentPage: 1,
        pageSize: size,
      }),
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingSegmentsStat) {
        return (<i className="mcs-table-cell-loading" />); // (<span>loading...</span>);
      }

      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';

      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'TYPE',
        key: 'type',
        isHideable: false,
        render: (text) => {
          switch (text) {
            case 'USER_ACTIVATION':
              return (
                <Tooltip placement="top" title={translations[text]}>
                  <Icon type="rocket" />
                </Tooltip>
              );
            case 'USER_QUERY':
              return (
                <Tooltip placement="top" title={translations[text]}>
                  <Icon type="database" />
                </Tooltip>
              );
            case 'USER_LIST':
              return (
                <Tooltip placement="top" title={translations[text]}>
                  <Icon type="solution" />
                </Tooltip>
              );
            case 'USER_PIXEL':
              return (
                <Tooltip placement="top" title={translations[text]}>
                  <Icon type="global" />
                </Tooltip>
              );
            default:
              return (
                <Tooltip placement="top" title={translations[text]}>
                  <Icon type="database" />
                </Tooltip>
              );
          }
        },
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >{text}
          </Link>
        ),
      },
      {
        translationKey: 'TECHNICAL_NAME',
        isVisibleByDefault: false,
        key: 'technical_name',
        isHideable: true,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >{text}
          </Link>
        ),
      },
      {
        translationKey: 'USER_POINTS',
        key: 'user_points',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'USER_ACCOUNTS',
        key: 'user_accounts',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'EMAILS',
        key: 'emails',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'COOKIES',
        key: 'desktop_cookie_ids',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'ADDITION',
        key: 'user_point_additions',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'DELETION',
        key: 'user_point_deletions',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editSegment,
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveSegment,
          },
        ],
      },
    ];

    const typeItems = ['USER_ACTIVATION', 'USER_LIST', 'USER_PIXEL', 'USER_QUERY']
      .map(type => ({ key: type, value: type }));

    const filtersOptions = [
      {
        displayElement: <div><FormattedMessage id="TYPE" /> <Icon type="down" /></div>,
        selectedItems: filter.types.map(type => ({ key: type, value: type })),
        items: typeItems,
        getKey: item => item.key,
        display: item => item.value,
        handleMenuClick: values =>
          this.updateLocationSearch({
            types: values.map(v => v.value),
          }),
      },
    ];


    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(filteredLabelId => filteredLabelId === label.id) ? true : false;
      }),
      onChange: (newLabels) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel
    };

    return (hasAudienceSegments
      ? (
        <div className="mcs-table-container">
          <TableViewFilters
            columns={dataColumns}
            actionsColumnsDefinition={actionColumns}
            searchOptions={searchOptions}
            dateRangePickerOptions={dateRangePickerOptions}
            filtersOptions={filtersOptions}
            columnsVisibilityOptions={columnsVisibilityOptions}
            dataSource={dataSource}
            loading={isFetchingAudienceSegments}
            pagination={pagination}
            labelsOptions={labelsOptions}
          />
        </div>
      )
      : <EmptyTableView iconType="users" text="EMPTY_SEGMENTS" />
    );
  }
}

AudienceSegmentsTable.defaultProps = {
  archiveAudienceSegment: () => { },
};

AudienceSegmentsTable.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  labels: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  hasAudienceSegments: PropTypes.bool.isRequired,
  isFetchingAudienceSegments: PropTypes.bool.isRequired,
  isFetchingSegmentsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalAudienceSegments: PropTypes.number.isRequired,

  defaultDatamart: PropTypes.func.isRequired,

  loadAudienceSegmentsDataSource: PropTypes.func.isRequired,
  archiveAudienceSegment: PropTypes.func.isRequired,
  resetAudienceSegmentsTable: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  labels: state.labels.labelsApi.data,
  hasAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.hasItems,
  isFetchingAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.isFetching,
  isFetchingSegmentsStat: state.audienceSegmentsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.total,
  defaultDatamart: getDefaultDatamart(state),
});

const mapDispatchToProps = {
  loadAudienceSegmentsDataSource: AudienceSegmentsActions.loadAudienceSegmentsDataSource,
  archiveAudienceSegment: AudienceSegmentsActions.archiveAudienceSegment,
  resetAudienceSegmentsTable: AudienceSegmentsActions.resetAudienceSegmentsTable,
};

AudienceSegmentsTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AudienceSegmentsTable);

AudienceSegmentsTable = withRouter(AudienceSegmentsTable);

export default AudienceSegmentsTable;
