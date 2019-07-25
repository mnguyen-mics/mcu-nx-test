import * as React from 'react';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Icon, Tooltip } from 'antd';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';

import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView';

import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  SearchSetting,
} from '../../../../utils/LocationSearchHelper';

import {
  formatMetric,
  normalizeReportView,
} from '../../../../utils/MetricHelper';
import { compose } from 'recompose';
import {
  AudienceSegmentResource,
  AudienceSegmentShape,
} from '../../../../models/audiencesegment';
import ReportService from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { Index } from '../../../../utils';
import { Label } from '../../../../components/LabelsSelector';
import {
  getPaginatedApiParam,
  CancelablePromise,
  makeCancelable,
} from '../../../../utils/ApiHelper';
import { getWorkspace } from '../../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '../../../../components/TableView/TableView';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import SegmentNameDisplay from '../../Common/SegmentNameDisplay';

const messages = defineMessages({
  filterByLabel: {
    id: 'audience.segments.list.label.filterBy',
    defaultMessage: 'Filter By Label',
  },
  modalTitle: {
    id: 'audience.segments.list.archive.modal.title',
    defaultMessage: 'Are you sure you want to archive this Segment?',
  },
  modalText: {
    id: 'audience.segments.list.archive.modal.text',
    defaultMessage:
      'By archiving this Segment all it will stop campaign using it. Are you sure?',
  },
  modalOk: {
    id: 'audience.segments.list.archive.modal.ok',
    defaultMessage: 'Ok',
  },
  modalCancel: {
    id: 'audience.segments.list.archive.modal.cancel',
    defaultMessage: 'Cancel',
  },
  searchTitle: {
    id: 'audience.segments.list.search.title',
    defaultMessage: 'Search Segments',
  },
  userActivation: {
    id: 'audience.segments.list.type.userActivation',
    defaultMessage: 'User Activation',
  },
  userLookalike: {
    id: 'audience.segments.list.type.userLookalike',
    defaultMessage: 'User Lookalike',
  },
  userPartition: {
    id: 'audience.segments.list.type.userPartition',
    defaultMessage: 'User Partition',
  },
  userQuery: {
    id: 'audience.segments.list.type.userQuery',
    defaultMessage: 'User Query',
  },
  userList: {
    id: 'audience.segments.list.type.userList',
    defaultMessage: 'User List',
  },
  userPixel: {
    id: 'audience.segments.list.type.userPixel',
    defaultMessage: 'User Pixel',
  },
  userUnknown: {
    id: 'audience.segments.list.type.userUnknown',
    defaultMessage: 'Unknown Type',
  },
  filterType: {
    id: 'audience.segments.list.filter.type',
    defaultMessage: 'Type',
  },
  userActivationClickers: {
    id: 'audience.segments.list.useractivation.clickers',
    defaultMessage: '{audienceSegmentName} - Clickers',
  },
  userActivationExposed: {
    id: 'audience.segments.list.useractivation.exposed',
    defaultMessage: '{audienceSegmentName} - Exposed',
  },
  name: {
    id: 'audience.segments.list.column.name',
    defaultMessage: 'Name',
  },
  technicalName: {
    id: 'audience.segments.list.column.technicalName',
    defaultMessage: 'Technical Name',
  },
  type: {
    id: 'audience.segments.list.column.type',
    defaultMessage: 'Type',
  },
  userAccounts: {
    id: 'audience.segments.list.column.userAccounts',
    defaultMessage: 'User Accounts',
  },
  userPoints: {
    id: 'audience.segments.list.column.userPoints',
    defaultMessage: 'User Points',
  },
  addition: {
    id: 'audience.segments.list.column.addition',
    defaultMessage: 'Addition',
  },
  deletion: {
    id: 'audience.segments.list.column.deletion',
    defaultMessage: 'Deletion',
  },
  cookies: {
    id: 'audience.segments.list.column.cookies',
    defaultMessage: 'Cookies',
  },
  emails: {
    id: 'audience.segments.list.column.emails',
    defaultMessage: 'Emails',
  },
  editSegment: {
    id: 'audience.segments.list.editSegment',
    defaultMessage: 'Edit',
  },
});

export interface AudienceSegmentsTableProps {}

interface MapStateToProps {
  labels: Label[];
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = RouteComponentProps<{ organisationId: string }> &
  MapStateToProps &
  InjectedIntlProps &
  InjectedDatamartProps;

interface State {
  list: {
    segments: AudienceSegmentResource[];
    total: number;
    isLoading: boolean;
  };
  reportView: {
    data: Array<Index<any>>;
    isLoading: boolean;
  };
  hasItem: boolean;
}

class AudienceSegmentsTable extends React.Component<Props, State> {
  cancellablePromises: Array<CancelablePromise<any>> = [];
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    this.state = {
      list: {
        isLoading: true,
        total: 0,
        segments: [],
      },
      reportView: {
        data: [],
        isLoading: true,
      },
      hasItem: true,
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
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
      const filter = parseSearch(search, this.getSearchSetting(organisationId));
      const datamartId = filter.datamartId;
      this.fetchAudienceSegments(organisationId, datamartId, filter);
      this.fetchAudienceSegmentStatistics(organisationId, datamartId);
      this.checkIfHasItem(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.cancellablePromises.forEach(promise => {
      promise.cancel();
    });
  }

  checkIfHasItem = (organisationId: string, filter: Index<any>) => {
    const newFilters = {
      with_third_parties: true,
      ...getPaginatedApiParam(1, 1),
    };
    return this._audienceSegmentService
      .getSegments(organisationId, newFilters)
      .then(res => {
        this.setState({ hasItem: res.count !== 0 });
      });
  };

  fetchAudienceSegments = (
    organisationId: string,
    datamartId: string,
    filter: Index<any>,
  ) => {
    return this._audienceSegmentService
      .getSegments(
        organisationId,
        this.buildApiSearchFilters(filter, datamartId),
      )
      .then(res => {
        this.setState({
          list: {
            segments: res.data,
            total: res.total ? res.total : res.count,
            isLoading: false,
          },
        });
      });
  };

  fetchAudienceSegmentStatistics = (
    organisationId: string,
    datamartId: string,
  ) => {
    const cancelablePromise = makeCancelable(
      ReportService.getAudienceSegmentReport(
        organisationId,
        new McsMoment('now'),
        new McsMoment('now'),
        ['audience_segment_id'],
      ),
    );
    this.cancellablePromises.push(cancelablePromise);
    return cancelablePromise.promise.then(res => {
      this.setState({
        reportView: {
          data: normalizeReportView(res.data.report_view),
          isLoading: false,
        },
      });
    });
  };

  buildApiSearchFilters = (filter: Index<any>, datamartId?: string) => {
    let formattedFilters: Index<any> = {
      with_third_parties: true,
    };
    if (filter.currentPage && filter.pageSize) {
      formattedFilters = {
        ...formattedFilters,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
    }
    if (datamartId) {
      formattedFilters = {
        ...formattedFilters,
        datamart_id: datamartId,
      };
    }
    if (filter.keywords) {
      formattedFilters = {
        ...formattedFilters,
        keywords: filter.keywords,
      };
    }
    if (filter.type.length) {
      formattedFilters = {
        ...formattedFilters,
        type: filter.type,
      };
    }
    if (filter.label_id.length) {
      formattedFilters = {
        ...formattedFilters,
        label_id: filter.label_id,
      };
    }
    if (filter.type.length) {
      formattedFilters = {
        ...formattedFilters,
        type: filter.type,
      };
    }
    return formattedFilters;
  };

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state: nextState,
      },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId ||
      (nextState && nextState.reloadDataSource === true)
    ) {
      if (
        !isSearchValid(nextSearch, this.getSearchSetting(nextOrganisationId))
      ) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            this.getSearchSetting(nextOrganisationId),
          ),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(
          search,
          this.getSearchSetting(organisationId),
        );
        const nextFilter = parseSearch(
          nextSearch,
          this.getSearchSetting(nextOrganisationId),
        );
        const datamartId = nextFilter.datamartId;
        this.setState({ list: { ...this.state.list, isLoading: true } });
        this.fetchAudienceSegments(nextOrganisationId, datamartId, nextFilter);
        this.checkIfHasItem(organisationId, filter);
        if (
          organisationId !== nextOrganisationId ||
          (nextState && nextState.reloadDataSource === true)
        ) {
          this.setState({
            reportView: { ...this.state.reportView, isLoading: true },
          });
          this.fetchAudienceSegmentStatistics(nextOrganisationId, datamartId);
        }
      }
    }
  }

  // archiveSegment = (segment: AudienceSegmentResource) => {
  //   const {
  //     match: {
  //       params: {
  //         organisationId,
  //       },
  //     },
  //     location: {
  //       search,
  //     },
  //     intl,
  //   } = this.props;

  //   const filter = parseSearch(search, this.getSearchSetting(organisationId));

  //   const archiveAudienceSegment = () => {
  //     return AudienceSegmentService.
  //   }

  //   Modal.confirm({
  //     title: intl.formatMessage(messages.modalTitle),
  //     content: intl.formatMessage(messages.modalText),
  //     iconType: 'exclamation-circle',
  //     okText: intl.formatMessage(messages.modalOk),
  //     cancelText: intl.formatMessage(messages.modalCancel),
  //     onOk() {
  //       return archiveAudienceSegment(segment.id).then(() => {
  //         const datamartId = filter.datamarts[0];
  //         loadAudienceSegmentsDataSource(organisationId, datamartId, filter);
  //       });
  //     },
  //     onCancel() {
  //       // cancel
  //     },
  //   });
  // }

  editSegment = (segment: AudienceSegmentResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/audience/segments/${
      segment.id
    }/edit`;

    history.push(editUrl);
  };

  getSearchSetting(organisationId: string): SearchSetting[] {
    return [...SEGMENTS_SEARCH_SETTINGS];
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
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

  buildDataset = (
    segments: AudienceSegmentResource[],
    report: Array<Index<any>>,
  ) => {
    const formattedReport = normalizeArrayOfObject(
      report,
      'audience_segment_id',
    );

    return segments.map(segment => {
      return {
        ...formattedReport[segment.id as any],
        ...segment,
      };
    });
  };

  isPionusDatamart = (dmId?: string) => {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      workspace,
    } = this.props;
    const datamartId = dmId || queryString.parse(search).datamartId;
    const datamarts = workspace(organisationId).datamarts;
    const datamart = datamarts.find(d => d.id === datamartId);
    // case where there is only one Pionus datamart in the organisation,
    // and there is no datamartFilter and no datamartId in URL
    if (
      datamarts.length === 1 &&
      datamarts[0].storage_model_version !== 'v201506'
    ) {
      return true;
    }
    return datamart && datamart.storage_model_version !== 'v201506';
  };

  renderMetricData = (
    value: string | number,
    numeralFormat: string,
    currency: string = '',
  ) => {
    if (this.state.reportView.isLoading) {
      return <i className="mcs-table-cell-loading" />;
    }
    const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
    return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
  };

  buildDataColumns = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const dataColumns: Array<DataColumnDefinition<AudienceSegmentShape>> = [
      {
        intlMessage: messages.type,
        key: 'type',
        isHideable: false,
        render: (text: string) => {
          switch (text) {
            case 'USER_ACTIVATION':
              return (
                <Tooltip
                  placement="top"
                  title={intl.formatMessage(messages.userActivation)}
                >
                  <Icon type="rocket" />
                </Tooltip>
              );
            case 'USER_QUERY':
              return (
                <Tooltip
                  placement="top"
                  title={intl.formatMessage(messages.userQuery)}
                >
                  <Icon type="database" />
                </Tooltip>
              );
            case 'USER_LIST':
              return (
                <Tooltip
                  placement="top"
                  title={intl.formatMessage(messages.userList)}
                >
                  <Icon type="solution" />
                </Tooltip>
              );
            case 'USER_PIXEL':
              return (
                <Tooltip
                  placement="top"
                  title={intl.formatMessage(messages.userPixel)}
                >
                  <Icon type="global" />
                </Tooltip>
              );
            case 'USER_PARTITION':
              return (
                <Tooltip
                  placement="top"
                  title={intl.formatMessage(messages.userPartition)}
                >
                  <Icon type="api" />
                </Tooltip>
              );
            case 'USER_LOOKALIKE':
              return (
                <Tooltip
                  placement="top"
                  title={intl.formatMessage(messages.userLookalike)}
                >
                  <Icon type="usergroup-add" />
                </Tooltip>
              );
            default:
              return (
                <Tooltip placement="top" title={text}>
                  <Icon type="database" />
                </Tooltip>
              );
          }
        },
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: AudienceSegmentShape) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >
            <SegmentNameDisplay audienceSegmentResource={record} />
          </Link>
        ),
      },
      {
        intlMessage: messages.technicalName,
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
        intlMessage: messages.userPoints,
        key: 'user_points',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.userAccounts,
        key: 'user_accounts',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.emails,
        key: 'emails',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.cookies,
        key: 'desktop_cookie_ids',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
    ];

    const additionalColumns = [
      {
        intlMessage: messages.addition,
        key: 'user_point_additions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: AudienceSegmentShape) => {
          // When all segments from different datamarts are displayed
          // we can't remove addition or deletion columns
          // so we return '-' if the segment is from a pionus datamart
          return this.isPionusDatamart(record.datamart_id)
            ? '-'
            : this.renderMetricData(text, '0,0');
        },
      },
      {
        intlMessage: messages.deletion,
        key: 'user_point_deletions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: AudienceSegmentShape) => {
          // When all segments from different datamarts are displayed
          // we can't remove addition or deletion columns
          // so we return '-' if the segment is from a pionus datamart
          return this.isPionusDatamart(record.datamart_id)
            ? '-'
            : this.renderMetricData(text, '0,0');
        },
      },
    ];
    return this.isPionusDatamart()
      ? dataColumns
      : dataColumns.concat(additionalColumns);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      labels,
      intl,
      workspace,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    const searchOptions = {
      placeholder: intl.formatMessage(messages.searchTitle),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

    const columnsVisibilityOptions = {
      isEnabled: true,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: this.state.list.total,
      onChange: (page: number, size: number) =>
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const actionColumns: Array<
      ActionsColumnDefinition<AudienceSegmentResource>
    > = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editSegment,
            callback: this.editSegment,
          },
          // {
          //   intlMessage: messageMap.archive,
          //   callback: this.archiveSegment,
          // },
        ],
      },
    ];

    const typeItems = [
      'USER_ACTIVATION',
      'USER_LIST',
      'USER_QUERY',
      'USER_PARTITION',
      'USER_LOOKALIKE',
    ].map(type => ({ key: type, value: type }));

    const datamartItems = workspace(organisationId)
      .datamarts.map(d => ({
        key: d.id,
        value: d.name || d.token,
      }))
      .concat([
        {
          key: '',
          value: 'All',
        },
      ]);

    const filtersOptions: Array<MultiSelectProps<any>> = [
      {
        displayElement: (
          <div>
            <FormattedMessage {...messages.filterType} /> <Icon type="down" />
          </div>
        ),
        selectedItems: filter.type.map((type: string) => ({
          key: type,
          value: type,
        })),
        items: typeItems,
        getKey: (item: { key: string; value: string }) => item.key,
        display: (item: { key: string; value: string }) => item.value,
        handleMenuClick: (values: Array<{ key: string; value: string }>) =>
          this.updateLocationSearch({
            type: values.map(v => v.value),
            currentPage: 1,
          }),
      },
    ];

    if (workspace(organisationId).datamarts.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage
              id="audience.segments.list.datamartFilter"
              defaultMessage="Datamart"
            />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.datamartId
          ? [datamartItems.find(di => di.key === filter.datamartId)]
          : [datamartItems],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.updateLocationSearch({
            datamartId:
              datamartItem && datamartItem.key ? datamartItem.key : undefined,
            currentPage: 1,
          });
        },
      };
      filtersOptions.push(datamartFilter);
    }

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
        this.updateLocationSearch({
          label_id: formattedLabels,
          currentPage: 1,
        });
      },
      buttonMessage: messages.filterByLabel,
    };

    return this.state.hasItem ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={this.buildDataColumns()}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          filtersOptions={filtersOptions}
          columnsVisibilityOptions={columnsVisibilityOptions}
          dataSource={this.buildDataset(
            this.state.list.segments,
            this.state.reportView.data,
          )}
          loading={this.state.list.isLoading}
          pagination={pagination}
          labelsOptions={labelsOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="data" text="EMPTY_SEGMENTS" />
    );
  }
}

const mapStateToProps = (state: any) => ({
  labels: state.labels.labelsApi.data,
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(mapStateToProps),
)(AudienceSegmentsTable);
