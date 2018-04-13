import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
import { compose } from 'recompose';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';

import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index';
import * as AudienceSegmentsActions from '../../../../state/Audience/Segments/actions';

import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper';
import { getTableDataSource } from '../../../../state/Audience/Segments/selectors';
import { getWorkspace } from '../../../../state/Session/selectors';
import { Label } from '../../../Labels/Labels';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { McsDateRangeValue } from '../../../../components/McsDateRangePicker';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { withTranslations } from '../../../Helpers';
import McsMoment from '../../../../utils/McsMoment';

const messages = defineMessages({
  filterByLabel: {
    id: 'audience.label.filterBy',
    defaultMessage: 'Filter By Label',
  },
  archiveSegmentModalTitle: {
    id: 'audience.segment.list.archive.segment.modal.title',
    defaultMessage: 'Are you sure you want to archive this segment ?',
  },
  archiveSegmentModalContent: {
    id: 'audience.segment.list.archive.segment.modal.content',
    defaultMessage:
      "By archiving this segment all its activities will be suspended. You'll be able to recover it from the archived audience segment filter.",
  },
  archiveSegmentModalOk: {
    id: 'audience.segment.list.archive.segment.modal.ok',
    defaultMessage: 'Archive Now',
  },
  archiveSegmentModalCancel: {
    id: 'audience.segment.list.archive.segment.modal.cancel',
    defaultMessage: 'Cancel',
  },
  searchAudienceSegments: {
    id: 'audience.segment.list.search.placeholder',
    defaultMessage: 'Search Segments',
  },
  audienceSegmentsTableColumnTypeActivation: {
    id: 'audience.segment.table.column.type.activation',
    defaultMessage: 'Activation',
  },
  audienceSegmentsTableColumnTypeQuery: {
    id: 'audience.segment.table.column.type.query',
    defaultMessage: 'Query',
  },
  audienceSegmentsTableColumnTypeList: {
    id: 'audience.segment.table.column.type.list',
    defaultMessage: 'List',
  },
  audienceSegmentsTableColumnTypePixel: {
    id: 'audience.segment.table.column.type.pixel',
    defaultMessage: 'Pixel',
  },
  audienceSegmentsTableColumnTypeDefault: {
    id: 'audience.segment.table.column.type.default',
    defaultMessage: 'Query',
  },
});

interface MapStateToProps {
  labels: Label[];
  hasAudienceSegments: boolean;
  isFetchingAudienceSegments: boolean;
  isFetchingSegmentsStat: boolean;
  dataSource: AudienceSegmentResource[];
  totalAudienceSegments: number;
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface FilterProps {
  currentPage: number;
  from: McsMoment;
  to: McsMoment;
  keywords: string[];
  pageSize: number;
  datamart?: string;
}

interface MapDispatchToProps {
  loadAudienceSegmentsDataSource: (
    organisationId: string,
    filter: FilterProps,
    checkEmptyDataSource?: boolean,
    datamartId?: string
  ) => AudienceSegmentResource[];
  archiveAudienceSegment: (segmentId: string) => Promise<any>;
  resetAudienceSegmentsTable: () => AudienceSegmentResource[];
  translations: TranslationProps;
}

type Props = MapStateToProps &
  MapDispatchToProps &
  InjectedIntlProps &
  TranslationProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceSegmentsTable extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
    } = this.props;
    if (!isSearchValid(search, this.getSearchSetting(organisationId))) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(
          search,
          this.getSearchSetting(organisationId),
        ),
        state: { reloadDataSource: true },
      });
    } else {
      this.loadAudienceSegmentsData();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      location: { search, pathname },
      match: { params: { organisationId } },
      history,
      loadAudienceSegmentsDataSource,
    } = this.props;

    const {
      location: { search: prevSearch, state },
      match: { params: { organisationId: prevOrganisationId } },
    } = prevProps;

    const checkEmptyDataSource = state && state.reloadDataSource;
    if (
      !compareSearches(search, prevSearch) ||
      organisationId !== prevOrganisationId
    ) {
      if (
        !isSearchValid(search, this.getSearchSetting(organisationId))
      ) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(
            search,
            this.getSearchSetting(organisationId),
          ),
          state: { reloadDataSource: organisationId !== prevOrganisationId },
        });
      } else {
        const filter = parseSearch(
          search,
          this.getSearchSetting(organisationId),
        );
        loadAudienceSegmentsDataSource(
          organisationId,
          filter,
          checkEmptyDataSource,
          filter.datamart
        );
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAudienceSegmentsTable();
  }

  loadAudienceSegmentsData = (datamartId?: string) => {
    const {
      loadAudienceSegmentsDataSource,
      match: { params: { organisationId } },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, this.getSearchSetting(organisationId));
    loadAudienceSegmentsDataSource(organisationId, filter, true, filter.datamart);
  };

  archiveSegment = (segment: AudienceSegmentResource) => {
    const {
      match: { params: { organisationId } },
      location: { search },
      archiveAudienceSegment,
      loadAudienceSegmentsDataSource,
      intl: { formatMessage },
      // datamart,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    Modal.confirm({
      title: formatMessage(messages.archiveSegmentModalTitle),
      content: formatMessage(messages.archiveSegmentModalContent),
      iconType: 'exclamation-circle',
      okText: formatMessage(messages.archiveSegmentModalOk),
      cancelText: formatMessage(messages.archiveSegmentModalCancel),
      onOk() {
        return archiveAudienceSegment(segment.id).then(() => {
          // const datamartId = datamart.id;
          loadAudienceSegmentsDataSource(organisationId, filter);
        });
      },
      onCancel() {
        //
      },
    });
  };

  editSegment = (segment: AudienceSegmentResource) => {
    const { match: { params: { organisationId } }, history } = this.props;

    const editUrl = `/v2/o/${organisationId}/audience/segments/${
      segment.id
    }/edit`;

    history.push(editUrl);
  };

  getSearchSetting(organisationId: string) {
    return [...SEGMENTS_SEARCH_SETTINGS];
  }

  updateLocationSearch = (
    params: Partial<FilterProps> & {
      types?: any;
      label_id?: string[];
    },
  ) => {
    const {
      history,
      match: { params: { organisationId } },
      location: { search: currentSearch, pathname },
    } = this.props;
    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        this.getSearchSetting(organisationId),
      ),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: { params: { organisationId } },
      location: { search },
      isFetchingAudienceSegments,
      isFetchingSegmentsStat,
      dataSource,
      totalAudienceSegments,
      hasAudienceSegments,
      labels,
      intl: { formatMessage },
      workspace,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    const searchOptions = {
      placeholder: formatMessage(messages.searchAudienceSegments),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: [value],
        }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values: McsDateRangeValue) =>
        this.updateLocationSearch({
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
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const renderMetricData = (
      value: string,
      numeralFormat: string,
      currency = '',
    ) => {
      if (isFetchingSegmentsStat) {
        return <i className="mcs-table-cell-loading" />; // (<span>loading...</span>);
      }

      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';

      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'TYPE',
        key: 'type',
        isHideable: false,
        render: (text: string) => {
          switch (text) {
            case 'USER_ACTIVATION':
              return (
                <Tooltip
                  placement="top"
                  title={formatMessage(
                    messages.audienceSegmentsTableColumnTypeActivation,
                  )}
                >
                  <Icon type="rocket" />
                </Tooltip>
              );
            case 'USER_QUERY':
              return (
                <Tooltip
                  placement="top"
                  title={formatMessage(
                    messages.audienceSegmentsTableColumnTypeQuery,
                  )}
                >
                  <Icon type="database" />
                </Tooltip>
              );
            case 'USER_LIST':
              return (
                <Tooltip
                  placement="top"
                  title={formatMessage(
                    messages.audienceSegmentsTableColumnTypeList,
                  )}
                >
                  <Icon type="solution" />
                </Tooltip>
              );
            case 'USER_PIXEL':
              return (
                <Tooltip
                  placement="top"
                  title={formatMessage(
                    messages.audienceSegmentsTableColumnTypePixel,
                  )}
                >
                  <Icon type="global" />
                </Tooltip>
              );
            default:
              return (
                <Tooltip
                  placement="top"
                  title={formatMessage(
                    messages.audienceSegmentsTableColumnTypeDefault,
                  )}
                >
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
        render: (text: string, record: AudienceSegmentResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'TECHNICAL_NAME',
        isVisibleByDefault: false,
        key: 'technical_name',
        isHideable: true,
        render: (text: string, record: AudienceSegmentResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'USER_POINTS',
        key: 'user_points',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'USER_ACCOUNTS',
        key: 'user_accounts',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'EMAILS',
        key: 'emails',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'COOKIES',
        key: 'desktop_cookie_ids',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'ADDITION',
        key: 'user_point_additions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'DELETION',
        key: 'user_point_deletions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editSegment,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveSegment,
          },
        ],
      },
    ];

    const typeItems = [
      'USER_ACTIVATION',
      'USER_LIST',
      'USER_PIXEL',
      'USER_QUERY',
    ].map(type => ({ key: type, value: type }));

    const datamartItems = workspace(organisationId)
      .datamarts.map(d => ({
        key: d.id,
        value: d.name,
      }))
      .concat([
        {
          key: '',
          value: 'All',
        },
      ]);

    const filtersOptions = [
      {
        displayElement: (
          <div>
            <FormattedMessage id="TYPE" defaultMessage="TYPE" />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.types.map((type: string) => ({
          key: type,
          value: type,
        })),
        items: typeItems,
        getKey: (item: any) => item.key,
        display: (item: any) => item.value,
        handleMenuClick: (values: any) =>
          this.updateLocationSearch({
            types: values.map((v: any) => v.value),
          }),
      },
      {
        displayElement: (
          <div>
            <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.datamart
          ? [datamartItems.find(di => di.key === filter.datamart)]
          : [datamartItems],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.updateLocationSearch({
            datamart: datamartItem && datamartItem.key ? datamartItem.key : undefined,
          });
        },
      },
    ];

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(
          (filteredLabelId: string) => filteredLabelId === label.id,
        )
          ? true
          : false;
      }),
      onChange: (newLabels: Label[]) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel,
    };

    return hasAudienceSegments ? (
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
    ) : (
      <EmptyTableView iconType="users" text="EMPTY_SEGMENTS" />
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
  labels: state.labels.labelsApi.data,
  hasAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.hasItems,
  isFetchingAudienceSegments:
    state.audienceSegmentsTable.audienceSegmentsApi.isFetching,
  isFetchingSegmentsStat:
    state.audienceSegmentsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAudienceSegments: state.audienceSegmentsTable.audienceSegmentsApi.total,
  workspace: getWorkspace(state),
});

const mapDispatchToProps = {
  loadAudienceSegmentsDataSource:
    AudienceSegmentsActions.loadAudienceSegmentsDataSource,
  // archiveAudienceSegment: AudienceSegmentsActions.archiveAudienceSegment,
  resetAudienceSegmentsTable:
    AudienceSegmentsActions.resetAudienceSegmentsTable,
};

export default compose<Props, MapDispatchToProps>(
  injectIntl,
  withRouter,
  injectDatamart,
  withTranslations,
  connect(mapStateToProps, mapDispatchToProps),
)(AudienceSegmentsTable);
