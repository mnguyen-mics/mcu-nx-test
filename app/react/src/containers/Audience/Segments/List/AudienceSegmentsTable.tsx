import * as React from 'react';
import queryString from 'query-string';
import { connect } from 'react-redux';
import _ from 'lodash';
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
} from '../../../../components/TableView';
import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  SearchSetting,
  KeywordSearchSettings,
  PaginationSearchSettings,
  TypeSearchSettings,
  LabelsSearchSettings,
  DatamartSearchSettings,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { Button, EmptyTableView } from '@mediarithmics-private/mcs-components-library';
import { formatMetric } from '../../../../utils/MetricHelper';
import { compose } from 'recompose';
import {
  AudienceSegmentResource,
  AudienceSegmentShape,
  UserListSegment,
} from '../../../../models/audiencesegment';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { Index } from '../../../../utils';
import {
  getPaginatedApiParam,
  CancelablePromise,
} from '../../../../utils/ApiHelper';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '../../../../components/TableView/TableView';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { SegmentNameDisplay } from '../../Common/SegmentNameDisplay';
import { notifyError } from '../../../../redux/Notifications/actions';
import { McsIcon } from '../../../../components';
import { Label } from '../../../Labels/Labels';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import {
  audienceSegmentTypeMessages,
  userListFeedTypeMessages,
} from '../Dashboard/messages';
import TreeSelectFilter, { TreeSelectFilterProps } from '../../../../components/TreeSelectFilter';

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
  USER_ACTIVATION: {
    id: 'audience.segments.list.type.userActivation',
    defaultMessage: 'User Activation',
  },
  USER_LOOKALIKE: {
    id: 'audience.segments.list.type.userLookalike',
    defaultMessage: 'User Lookalike',
  },
  USER_PARTITION: {
    id: 'audience.segments.list.type.userPartition',
    defaultMessage: 'User Partition',
  },
  USER_QUERY: {
    id: 'audience.segments.list.type.userQuery',
    defaultMessage: 'User Query',
  },
  USER_LIST: {
    id: 'audience.segments.list.type.userList',
    defaultMessage: 'User List',
  },
  FILE_IMPORT: {
    id: 'audience.segments.list.type.userList.fileImport',
    defaultMessage: 'File Import',
  },
  TAG: {
    id: 'audience.segments.list.type.userList.tag',
    defaultMessage: 'Tag',
  },
  SCENARIO: {
    id: 'audience.segments.list.type.userList.scenario',
    defaultMessage: 'Scenario',
  },
  USER_PIXEL: {
    id: 'audience.segments.list.type.userPixel',
    defaultMessage: 'User Pixel',
  },
  USER_CLIENT: {
    id: 'audience.segments.list.type.userClient',
    defaultMessage: 'User Client',
  },
  EDGE: {
    id: 'audience.segments.list.type.edge',
    defaultMessage: 'EDGE',
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
  addition: {
    id: 'audience.segments.list.column.addition',
    defaultMessage: 'Addition',
  },
  deletion: {
    id: 'audience.segments.list.column.deletion',
    defaultMessage: 'Deletion',
  },
  editSegment: {
    id: 'audience.segments.list.editSegment',
    defaultMessage: 'Edit',
  },
  more: {
    id: 'audience.segments.list.typeFilter.more',
    defaultMessage: 'More ...',
  },
  emptySegments: {
    id: 'audience.segments.list.emptyList',
    defaultMessage: 'No segments',
  },
});

const messageMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  user_accounts_count: {
    id: 'audience.segments.list.column.userAccounts',
    defaultMessage: 'User Accounts',
  },
  user_points_count: {
    id: 'audience.segments.list.column.userPoints',
    defaultMessage: 'User Points',
  },
  desktop_cookie_ids_count: {
    id: 'audience.segments.list.column.cookies',
    defaultMessage: 'Cookies',
  },
  emails_count: {
    id: 'audience.segments.list.column.emails',
    defaultMessage: 'Emails',
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

interface AudienceSegmentsFilterParams
  extends KeywordSearchSettings,
    PaginationSearchSettings,
    TypeSearchSettings,
    LabelsSearchSettings,
    DatamartSearchSettings {
  orderBy?: string;
}

interface State {
  list: {
    segments: AudienceSegmentShape[];
    total: number;
    isLoading: boolean;
  };
  hasItems: boolean;
  isAsc?: boolean;
  sortField?: string;
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
      hasItems: true,
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

    if (!isSearchValid(search, this.getSearchSetting())) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, this.getSearchSetting()),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, this.getSearchSetting());
      const datamartId = filter.datamartId;
      this.fetchAudienceSegments(organisationId, datamartId, filter);
      this.checkIfHasItem(organisationId);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search, pathname },
      history,
    } = this.props;

    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      location: { search: prevSearch },
    } = prevProps;

    const filter = parseSearch<AudienceSegmentsFilterParams>(
      search,
      this.getSearchSetting(),
    );

    const prevFilter = parseSearch<AudienceSegmentsFilterParams>(
      prevSearch,
      this.getSearchSetting(),
    );

    const datamartId = filter.datamartId;

    if (!isSearchValid(search, this.getSearchSetting())) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, this.getSearchSetting()),
        state: { reloadDataSource: true },
      });
    } else if (
      // Changing the sort field : new API call with current
      !compareSearches(prevSearch, search) ||
      prevOrganisationId !== organisationId ||
      !_.isEqual(prevFilter, filter) ||
      (prevFilter.orderBy !== filter.orderBy &&
        filter.pageSize < this.state.list.total)
    ) {
      this.fetchAudienceSegments(organisationId, datamartId, filter);
    }
  }

  componentWillUnmount() {
    this.cancellablePromises.forEach(promise => {
      promise.cancel();
    });
  }

  checkIfHasItem = (organisationId: string) => {
    const newFilters = {
      with_third_parties: true,
      ...getPaginatedApiParam(1, 1),
    };
    return this._audienceSegmentService
      .getSegments(organisationId, newFilters)
      .then(res => {
        this.setState({ hasItems: res.count !== 0 });
      });
  };

  fetchAudienceSegments = (
    organisationId: string,
    datamartId: string | undefined,
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
      })
      .catch(e => {
        notifyError(e);
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
    if (filter.orderBy) {
      formattedFilters = {
        ...formattedFilters,
        order_by: filter.orderBy,
      };
    }
    const subtypes: string[] = filter.type.filter( (t: string) => t === "EDGE" || t === "USER_PIXEL")
    const types: string[] = filter.type.filter( (t: string) => t !== "EDGE" && t !== "USER_PIXEL")
    if (subtypes.length) {
      formattedFilters = {
        ...formattedFilters,
        subtype: subtypes,
      };
    }
    if (types.length) {
      formattedFilters = {
        ...formattedFilters,
        type: types,
      };
    }
    const feedtypes: string[] = (types.some((t: string) => t === "USER_LIST") && filter.feed_type.length === 0) ? ["SCENARIO", "FILE_IMPORT"] : filter.feed_type;
    if (feedtypes.length) {
      formattedFilters = {
        ...formattedFilters,
        feed_type: feedtypes,
      };
    }
    if (filter.label_id.length) {
      formattedFilters = {
        ...formattedFilters,
        label_id: filter.label_id,
      };
    }

    return formattedFilters;
  };

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

    const editUrl = `/v2/o/${organisationId}/audience/segments/${segment.id}/edit`;

    history.push(editUrl);
  };

  getSearchSetting(): SearchSetting[] {
    return [...SEGMENTS_SEARCH_SETTINGS];
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, this.getSearchSetting()),
    };

    history.push(nextLocation);
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
    if (this.state.list.isLoading) {
      return <i className="mcs-table-cell-loading" />;
    }
    const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
    return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
  };

  columnStatSort = (key: string, a?: number, b?: number) => {
    const getUrlString = (
      colunmKey: string,
      urlString?: string,
    ): string | undefined => {
      if (urlString) {
        if (urlString.startsWith('-')) {
          this.setState({ isAsc: undefined, sortField: undefined });
          return undefined;
        } else {
          this.setState({ isAsc: false, sortField: colunmKey });
          return `-${colunmKey}`;
        }
      }
      this.setState({ isAsc: true, sortField: colunmKey });
      return colunmKey;
    };

    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const filter = parseSearch<AudienceSegmentsFilterParams>(
      currentSearch,
      this.getSearchSetting(),
    );

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        {
          orderBy: getUrlString(key, filter.orderBy),
        },
        this.getSearchSetting(),
      ),
    };
    history.push(nextLocation);
  };

  getColumnButton(columnName: string): React.ReactNode {
    const { isAsc, sortField } = this.state;
    const searchOnClick = () => this.columnStatSort(columnName);
    return (
      <Button onClick={searchOnClick}>
        <FormattedMessage {...messageMap[columnName]} />
        <div className="mcs-table-header-icons">
          <McsIcon
            type="chevron"
            className={`${
              isAsc && sortField === columnName ? 'mcs-table-header-icon' : ''
            }`}
          />
          <McsIcon
            type="chevron"
            className={`${
              isAsc === false && sortField === columnName
                ? 'mcs-table-header-icon'
                : ''
            }`}
          />
        </div>
      </Button>
    );
  }

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
        render: (text: string, record: AudienceSegmentResource) => {
          let typeIcon = 'database';
          let subTypeIcon;
          let subMessage;
          switch (text) {
            case 'USER_ACTIVATION':
              typeIcon = 'rocket';
              break;
            case 'USER_QUERY':
              typeIcon = 'database';
              break;
            case 'USER_LIST': {
              typeIcon = 'solution';
              const subtype = (record as UserListSegment).subtype
              if (subtype === "EDGE" || subtype === "USER_CLIENT") {
                subTypeIcon = 'file-image';
                const subtypeEdge = "EDGE";
                subMessage = intl.formatMessage(messages[subtypeEdge]);
              }
              if (subtype === "USER_PIXEL") {
                subTypeIcon = 'global';
                subMessage = intl.formatMessage(messages[subtype]);
              }
              if (subtype === "STANDARD") {
                const feedType = (record as UserListSegment).feed_type;
                if (feedType === 'FILE_IMPORT') subTypeIcon = 'file';
                if (feedType === 'SCENARIO') subTypeIcon = 'share-alt';
                subMessage = intl.formatMessage(messages[feedType]);
              }
              break;
            }
            case 'USER_PARTITION':
              typeIcon = 'api';
              break;
            case 'USER_LOOKALIKE':
              typeIcon = 'usergroup-add';
              break;
            default:
              typeIcon = 'database';
              break;
          }
          return (
            <div className="mcs-audienceSegmentTable_type">
              <Tooltip
                placement="top"
                title={intl.formatMessage(messages[record.type] || text)}
              >
                <Icon type={typeIcon} />
              </Tooltip>
              {subTypeIcon && <span>&nbsp;&gt;&nbsp;</span>}
              {subTypeIcon && (
                <Tooltip placement="top" title={subMessage}>
                  <Icon type={subTypeIcon} />
                </Tooltip>
              )}
            </div>
          );
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
            <SegmentNameDisplay
              audienceSegmentResource={record}
              tableViewMode={true}
            />
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
        title: this.getColumnButton('user_points_count'),
        key: 'user_points_count',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('user_accounts_count'),
        key: 'user_accounts_count',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('emails_count'),
        key: 'emails_count',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('desktop_cookie_ids_count'),
        key: 'desktop_cookie_ids_count',
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

  renderTreeSelectFilter = (): React.ReactElement<TreeSelectFilter> => {
    const { 
      intl: { formatMessage }, 
      location: { search } 
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting());

    const treeSelectFilterProps: TreeSelectFilterProps = {
      className: 'mcs-table-filters-item mcs-audienceSegmentTable-typeFilter',
      placeholder: 'Type filter',
      parentFilterName: 'type',
      maxTagCount: 2,
      tree: [
        {
          title: formatMessage(audienceSegmentTypeMessages.USER_LIST),
          value: 'USER_LIST',
          childrenFilterName: 'feed_type',
          children: [
            {
              title: formatMessage(userListFeedTypeMessages.FILE_IMPORT),
              value: 'FILE_IMPORT'
            },{
              title: formatMessage(userListFeedTypeMessages.SCENARIO),
              value: 'SCENARIO'
            },
          ]
        },{
          title: formatMessage(audienceSegmentTypeMessages.USER_QUERY),
          value: 'USER_QUERY',
        },{
          title: formatMessage(audienceSegmentTypeMessages.USER_ACTIVATION),
          value: 'USER_ACTIVATION',
        },{
          title: formatMessage(audienceSegmentTypeMessages.USER_PARTITION),
          value: 'USER_PARTITION',
        },{
          title: formatMessage(audienceSegmentTypeMessages.USER_LOOKALIKE),
          value: 'USER_LOOKALIKE',
        },        {
          title: formatMessage(audienceSegmentTypeMessages.USER_PIXEL),
          value: 'USER_PIXEL',
        },{
          title: formatMessage(audienceSegmentTypeMessages.EDGE),
          value: 'EDGE',
        },
      ],
      selectedItems: filter.type.concat(filter.feed_type.map((ft: string) => `USER_LIST_${ft}`)),
      handleItemClick: (filters) => {
        this.updateLocationSearch({
          ...filters,
          currentPage: 1,
        });
      },
    };

    return <TreeSelectFilter {...treeSelectFilterProps}/>
  }

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

    const { hasItems, list } = this.state;

    const filter = parseSearch(search, this.getSearchSetting());

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

    const actionColumns: Array<ActionsColumnDefinition<
      AudienceSegmentShape
    >> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editSegment,
            callback: this.editSegment,
          },
          // {
          //   title: messageMap.archive,
          //   callback: this.archiveSegment,
          // },
        ],
      },
    ];

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

    const filtersOptions: Array<MultiSelectProps<any>> = [];

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

    return hasItems ? (
      <div className="mcs-table-container mcs-audienceSegmentTable">
        <TableViewFilters
          columns={this.buildDataColumns()}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          filtersOptions={filtersOptions}
          columnsVisibilityOptions={columnsVisibilityOptions}
          dataSource={list.segments}
          loading={list.isLoading}
          pagination={pagination}
          labelsOptions={labelsOptions}
          treeSelectFilter={this.renderTreeSelectFilter}
        />
      </div>
    ) : (
      <EmptyTableView iconType="data" message={intl.formatMessage(messages.emptySegments)} />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  labels: state.labels.labelsApi.data,
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(mapStateToProps),
)(AudienceSegmentsTable);
