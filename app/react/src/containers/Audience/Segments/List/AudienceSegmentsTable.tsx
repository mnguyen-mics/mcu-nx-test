import * as React from 'react';

import { connect } from 'react-redux';
import _ from 'lodash';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import {
  ApiOutlined,
  DatabaseOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileImageOutlined,
  FileOutlined,
  GlobalOutlined,
  RocketOutlined,
  ShareAltOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Tooltip, Modal } from 'antd';
import { FormattedMessage, defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
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
import {
  Button,
  EmptyTableView,
  McsIcon,
  TableViewFilters,
  TreeSelectFilter,
} from '@mediarithmics-private/mcs-components-library';
import { TreeSelectFilterProps } from '@mediarithmics-private/mcs-components-library/lib/components/tree-select-filter';
import { formatMetric } from '../../../../utils/MetricHelper';
import { compose } from 'recompose';
import {
  AudienceSegmentResource,
  AudienceSegmentShape,
  UserListSegment,
} from '../../../../models/audiencesegment';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { Index } from '../../../../utils';
import { getPaginatedApiParam, CancelablePromise } from '../../../../utils/ApiHelper';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { SegmentNameDisplay } from '../../Common/SegmentNameDisplay';
import { Label } from '../../../Labels/Labels';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { audienceSegmentTypeMessages, userListFeedTypeMessages } from '../Dashboard/messages';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { PermanentFilters, SegmentsColumnKey, SegmentsColumnsList } from './PermanentFilters';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { convertMessageDescriptorToString, labelSelectorMessages } from '../../../../IntlMessages';
import { LabelsSelectorMessages } from '@mediarithmics-private/mcs-components-library/lib/components/labels-selector';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';

const messages = defineMessages({
  filterByLabel: {
    id: 'audience.segments.list.label.filterBy',
    defaultMessage: 'Filter By Label',
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
  USER_LOOKALIKE_BY_COHORTS: {
    id: 'audience.segments.list.type.userCohortLookalike',
    defaultMessage: 'User Cohort Lookalike',
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
  SCENARIO_FEED: {
    id: 'audience.segments.list.type.userList.scenarioFeed',
    defaultMessage: 'Scenario Feed',
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
  deleteSegment: {
    id: 'audience.segments.list.deleteSegment',
    defaultMessage: 'Delete',
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
  modalTitle: {
    id: 'audience.segments.list.deleteSegment.modal.title',
    defaultMessage: 'Are you sure you want to delete this Segment?',
  },
  modalText: {
    id: 'audience.segments.list.deleteSegment.modal.text',
    defaultMessage:
      'You are about to definitively delete this segment : {name}. Are you sure you want to continue?',
  },
  modalOk: {
    id: 'audience.segments.list.deleteSegment.modal.ok',
    defaultMessage: 'Delete',
  },
  modalCancel: {
    id: 'audience.segments.list.deleteSegment.modal.cancel',
    defaultMessage: 'Cancel',
  },
});

const messageMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  creation_ts: {
    id: 'audience.segments.list.column.creation_ts',
    defaultMessage: 'Creation Date',
  },
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
  mobile_cookie_ids_count: {
    id: 'audience.segments.list.column.mobileCookie',
    defaultMessage: 'Mobile Cookies',
  },
  mobile_ad_ids_count: {
    id: 'audience.segments.list.column.mobileId',
    defaultMessage: 'Mobile IDs',
  },
  is_persisted: {
    id: 'audience.segments.list.is_persisted',
    defaultMessage: 'Is persisted',
  },
  persisted: {
    id: 'audience.segments.list.persisted',
    defaultMessage: 'Persisted',
  },
  not_persisted: {
    id: 'audience.segments.list.not_persisted',
    defaultMessage: 'Not persisted',
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
  InjectedNotificationProps &
  InjectedFeaturesProps &
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
  visibleColumns: Array<DataColumnDefinition<AudienceSegmentShape>>;
  isAsc?: boolean;
  sortField?: string;
}

class AudienceSegmentsTable extends React.Component<Props, State> {
  cancellablePromises: Array<CancelablePromise<any>> = [];
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);

    const permanentFilter = new PermanentFilters(this.props.datamart.organisation_id);
    this.state = {
      list: {
        isLoading: true,
        total: 0,
        segments: [],
      },
      hasItems: true,
      visibleColumns: permanentFilter.getVisibleColumns().map(key => ({ key: key, value: key })),
      ...permanentFilter.getOrderBy(),
    };
  }

  componentDidMount() {
    this.searchAudienceSegmentsWithFilter();
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

    const permanentFilter = new PermanentFilters(this.props.datamart.organisation_id);
    const theoreticalVisibleColumns = permanentFilter.getVisibleColumns();
    const actualVisibleColumns = this.state.visibleColumns.map(column => column.key);
    if (!_.isEqual(theoreticalVisibleColumns, actualVisibleColumns)) {
      this.setState({
        visibleColumns: theoreticalVisibleColumns.map(key => ({ key: key, value: key })),
      });
    }
    const realSearch = search || permanentFilter.getSearch();

    const filter = parseSearch<AudienceSegmentsFilterParams>(realSearch, this.getSearchSetting());

    const prevFilter = parseSearch<AudienceSegmentsFilterParams>(
      prevSearch,
      this.getSearchSetting(),
    );

    const datamartId = filter.datamartId;

    if (!isSearchValid(search, this.getSearchSetting())) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(realSearch, this.getSearchSetting()),
        state: { reloadDataSource: true },
      });
    } else if (
      // Changing the sort field : new API call with current
      !compareSearches(prevSearch, realSearch) ||
      prevOrganisationId !== organisationId ||
      !_.isEqual(prevFilter, filter) ||
      (prevFilter.orderBy !== filter.orderBy && filter.pageSize < this.state.list.total)
    ) {
      permanentFilter.updateSearch(realSearch);
      this.fetchAudienceSegments(organisationId, datamartId, filter);
      const orderBy = permanentFilter.getOrderBy();
      if (orderBy.sortField !== this.state.sortField) {
        this.setState(previous => ({ ...previous, ...orderBy }));
      }
    }
  }

  componentWillUnmount() {
    this.cancellablePromises.forEach(promise => {
      promise.cancel();
    });
  }

  searchAudienceSegmentsWithFilter = () => {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const permanentFilter = new PermanentFilters(this.props.datamart.organisation_id);
    const realSearch = search || permanentFilter.getSearch();
    if (!this.state.sortField) {
      this.setState(previous => ({
        ...previous,
        ...permanentFilter.getOrderBy(),
      }));
    }
    if (!isSearchValid(search, this.getSearchSetting())) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(realSearch, this.getSearchSetting()),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(realSearch, this.getSearchSetting());
      const datamartId = filter.datamartId;
      this.fetchAudienceSegments(organisationId, datamartId, filter);
      this.checkIfHasItem(organisationId);
    }
  };

  checkIfHasItem = (organisationId: string) => {
    const newFilters = {
      with_third_parties: true,
      ...getPaginatedApiParam(1, 1),
    };
    return this._audienceSegmentService.getSegments(organisationId, newFilters).then(res => {
      this.setState({ hasItems: res.count !== 0 });
    });
  };

  fetchAudienceSegments = (
    organisationId: string,
    datamartId: string | undefined,
    filter: Index<any>,
  ) => {
    const { notifyError } = this.props;
    return this._audienceSegmentService
      .getSegments(organisationId, this.buildApiSearchFilters(filter, datamartId))
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
    const isUserList = (t: string) => t === 'USER_LIST';
    const isEdgeOrUserPixel = (t: string) => t === 'EDGE' || t === 'USER_PIXEL';
    const subtypes: string[] = filter.type.filter(isEdgeOrUserPixel);
    if (filter.type.some(isUserList)) subtypes.push('STANDARD');
    const types: string[] = filter.type.filter((t: string) => t !== 'EDGE' && t !== 'USER_PIXEL');
    if (subtypes.length) {
      formattedFilters = {
        ...formattedFilters,
        subtype: subtypes,
      };
    }
    const showUserListOnly = types.filter(isUserList).length === 0 && subtypes.length > 0;
    const showAllSegmentTypes = types.length === 0 && subtypes.length === 0;
    const allSegmentTypes = [
      'USER_LIST',
      'USER_QUERY',
      'USER_LOOKALIKE',
      'USER_LOOKALIKE_BY_COHORTS',
      'USER_ACTIVATION',
      'USER_PARTITION',
      'USER_DATA_SUBSCRIPTION',
    ];
    const calculatedTypes = showUserListOnly
      ? ['USER_LIST']
      : showAllSegmentTypes
      ? allSegmentTypes
      : types;
    formattedFilters = {
      ...formattedFilters,
      type: calculatedTypes,
    };
    const allfeedtypes = ['SCENARIO', 'FILE_IMPORT', 'TAG'];
    const feedtypes: string[] =
      calculatedTypes.some(isUserList) && filter.feed_type.length === 0
        ? allfeedtypes
        : filter.feed_type;
    if (filter.type.some(isEdgeOrUserPixel)) feedtypes.push('TAG'); // An edge segment can have the feedtype tag, we want to fetch them

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

    if (filter.persisted) {
      formattedFilters = {
        ...formattedFilters,
        persisted: filter.persisted,
      };
    }

    return formattedFilters;
  };

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

  deleteSegment = (segment: AudienceSegmentResource) => {
    const { intl, notifyError } = this.props;

    const deleteSeg = () => this._audienceSegmentService.deleteAudienceSegment(segment.id);
    const refreshSearch = () => this.searchAudienceSegmentsWithFilter();

    Modal.confirm({
      className: 'mcs-audienceSegmentDeletePopup',
      title: intl.formatMessage(messages.modalTitle),
      content: intl.formatMessage(messages.modalText, { name: segment.name }),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage(messages.modalOk),
      cancelText: intl.formatMessage(messages.modalCancel),
      okButtonProps: { className: 'mcs-audienceSegmentDeletePopup_ok_button' },
      cancelButtonProps: { className: 'mcs-audienceSegmentDeletePopup_cancel_button' },
      onOk() {
        return deleteSeg()
          .then(() => {
            refreshSearch();
          })
          .catch(err => {
            notifyError(err);
          });
      },
      onCancel() {
        //
      },
    });
  };

  getSearchSetting(): SearchSetting[] {
    return [...SEGMENTS_SEARCH_SETTINGS];
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    new PermanentFilters(this.props.datamart.organisation_id).updateSearch(currentSearch);
    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, this.getSearchSetting()),
    };

    history.push(nextLocation);
  };

  renderMetricData = (value: string | number, numeralFormat: string, currency: string = '') => {
    if (this.state.list.isLoading) {
      return <i className='mcs-table-cell-loading' />;
    }
    const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
    return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
  };

  renderDateData = (value: string | number) => {
    if (this.state.list.isLoading) {
      return <i className='mcs-table-cell-loading' />;
    }
    if (typeof value === 'string') {
      value = parseInt(value, 10);
    }

    return `${new Date(value).toISOString()}`;
  };

  columnStatSort = (key: string, a?: number, b?: number) => {
    const getUrlString = (colunmKey: string, urlString?: string): string | undefined => {
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
        <div className='mcs-table-header-with-icons'>
          <FormattedMessage {...messageMap[columnName]} />
          <div className='mcs-table-header-icons'>
            <McsIcon
              type='chevron'
              className={`${isAsc && sortField === columnName ? 'mcs-table-header-icon' : ''}`}
            />
            <McsIcon
              type='chevron'
              className={`${
                isAsc === false && sortField === columnName ? 'mcs-table-header-icon' : ''
              }`}
            />
          </div>
        </div>
      </Button>
    );
  }

  buildDataColumns = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const permanentFilter = new PermanentFilters(this.props.datamart.organisation_id);
    const columnsVisibility = permanentFilter.getColumnsVisibility();

    const dataColumns: Array<DataColumnDefinition<AudienceSegmentShape>> = [
      {
        title: formatMessage(messages.type),
        key: 'type',
        isHideable: false,
        render: (text: string, record: AudienceSegmentResource) => {
          let typeIcon = <DatabaseOutlined />;
          let subTypeIcon;
          let subMessage;
          switch (text) {
            case 'USER_ACTIVATION':
              typeIcon = <RocketOutlined />;
              break;
            case 'USER_QUERY':
              typeIcon = <DatabaseOutlined />;
              break;
            case 'USER_LIST': {
              typeIcon = <SolutionOutlined />;
              const subtype = (record as UserListSegment).subtype;
              if (subtype === 'EDGE' || subtype === 'USER_CLIENT') {
                subTypeIcon = <FileImageOutlined />;
                const subtypeEdge = 'EDGE';
                subMessage = formatMessage(messages[subtypeEdge]);
              }
              if (subtype === 'USER_PIXEL') {
                subTypeIcon = <GlobalOutlined />;
                subMessage = formatMessage(messages[subtype]);
              }
              if (subtype === 'STANDARD') {
                const feedType = (record as UserListSegment).feed_type;
                if (feedType === 'FILE_IMPORT') subTypeIcon = <FileOutlined />;
                if (feedType === 'SCENARIO') subTypeIcon = <ShareAltOutlined />;
                subMessage = formatMessage(messages[feedType]);
              }
              break;
            }
            case 'USER_PARTITION':
              typeIcon = <ApiOutlined />;
              break;
            case 'USER_LOOKALIKE':
              typeIcon = <UsergroupAddOutlined />;
              break;
            case 'USER_LOOKALIKE_BY_COHORTS':
              typeIcon = <UsergroupAddOutlined />;
              break;

            default:
              typeIcon = <DatabaseOutlined />;
              break;
          }
          return (
            <div className='mcs-audienceSegmentTable_type'>
              <Tooltip placement='top' title={formatMessage(messages[record.type] || text)}>
                {typeIcon}
              </Tooltip>
              {subTypeIcon && <span>&nbsp;&gt;&nbsp;</span>}
              {subTypeIcon && (
                <Tooltip placement='top' title={subMessage}>
                  {subTypeIcon}
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: AudienceSegmentShape) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >
            <SegmentNameDisplay audienceSegmentResource={record} tableViewMode={true} />
          </Link>
        ),
      },
      {
        title: formatMessage(messages.technicalName),
        isVisibleByDefault: columnsVisibility.get('technical_name'),
        key: 'technical_name',
        isHideable: true,
        render: (text: string, record: AudienceSegmentResource) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/audience/segments/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: this.getColumnButton('creation_ts'),
        key: 'creation_ts',
        isVisibleByDefault: columnsVisibility.get('creation_ts'),
        isHideable: true,
        render: (text: string) => this.renderDateData(text),
      },
      {
        title: this.getColumnButton('user_points_count'),
        key: 'user_points_count',
        isVisibleByDefault: columnsVisibility.get('user_points_count'),
        isHideable: true,
        render: (text: string) => (
          <span className='mcs-audienceSegments_user_points'>
            {this.renderMetricData(text, '0,0')}
          </span>
        ),
      },
      {
        title: () => this.getColumnButton('user_accounts_count'),
        key: 'user_accounts_count',
        isVisibleByDefault: columnsVisibility.get('user_accounts_count'),
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('emails_count'),
        key: 'emails_count',
        isVisibleByDefault: columnsVisibility.get('emails_count'),
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('desktop_cookie_ids_count'),
        key: 'desktop_cookie_ids_count',
        isVisibleByDefault: columnsVisibility.get('desktop_cookie_ids_count'),
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('mobile_cookie_ids_count'),
        key: 'mobile_cookie_ids_count',
        isVisibleByDefault: columnsVisibility.get('mobile_cookie_ids_count'),
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
      {
        title: () => this.getColumnButton('mobile_ad_ids_count'),
        key: 'mobile_ad_ids_count',
        isVisibleByDefault: columnsVisibility.get('mobile_cookie_ids_count'),
        isHideable: true,
        render: (text: string) => this.renderMetricData(text, '0,0'),
      },
    ];
    return dataColumns;
  };

  renderTreeSelectFilter = (): React.ReactElement<TreeSelectFilter> => {
    const {
      intl: { formatMessage },
      location: { search },
      hasFeature,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting());

    const treeSelectFilterProps: TreeSelectFilterProps = {
      className: 'mcs-table-filters-item mcs-audienceSegmentTable-typeFilter',
      placeholder: 'Type filter',
      parentFilterName: 'type',
      maxTagCount: 2,
      tree: [
        {
          className: 'mcs-audienceSegmentTable-typeFilter_userList',
          title: formatMessage(audienceSegmentTypeMessages.USER_LIST),
          value: 'USER_LIST',
          childrenFilterName: 'feed_type',
          children: [
            {
              title: formatMessage(userListFeedTypeMessages.FILE_IMPORT),
              value: 'FILE_IMPORT',
            },
            {
              title: formatMessage(userListFeedTypeMessages.SCENARIO),
              value: 'SCENARIO',
            },
          ],
        },
        {
          className: 'mcs-audienceSegmentTable-typeFilter_userQuery',
          title: formatMessage(audienceSegmentTypeMessages.USER_QUERY),
          value: 'USER_QUERY',
        },
        {
          className: 'mcs-audienceSegmentTable-typeFilter_userActivation',
          title: formatMessage(audienceSegmentTypeMessages.USER_ACTIVATION),
          value: 'USER_ACTIVATION',
        },
        {
          className: 'mcs-audienceSegmentTable-typeFilter_userPartition',
          title: formatMessage(audienceSegmentTypeMessages.USER_PARTITION),
          value: 'USER_PARTITION',
        },
        {
          className: 'mcs-audienceSegmentTable-typeFilter_userLookalike',
          title: formatMessage(audienceSegmentTypeMessages.USER_LOOKALIKE),
          value: 'USER_LOOKALIKE',
        },
      ]
        .concat(
          hasFeature('audience-segments-cohort-lookalike')
            ? [
                {
                  className: 'mcs-audienceSegmentTable-typeFilter_userCohortLookalike',
                  title: formatMessage(audienceSegmentTypeMessages.USER_LOOKALIKE_BY_COHORTS),
                  value: 'USER_LOOKALIKE_BY_COHORTS',
                },
              ]
            : [],
        )
        .concat([
          {
            className: 'mcs-audienceSegmentTable-typeFilter_userPixel',
            title: formatMessage(audienceSegmentTypeMessages.USER_PIXEL),
            value: 'USER_PIXEL',
          },
          {
            className: 'mcs-audienceSegmentTable-typeFilter_edge',
            title: formatMessage(audienceSegmentTypeMessages.EDGE),
            value: 'EDGE',
          },
        ]),
      selectedItems: filter.type.concat(filter.feed_type.map((ft: string) => `USER_LIST_${ft}`)),
      handleItemClick: filters => {
        this.updateLocationSearch({
          ...filters,
          currentPage: 1,
        });
      },
    };

    return <TreeSelectFilter {...treeSelectFilterProps} />;
  };

  onVisibilityChange = (columns: Array<DataColumnDefinition<AudienceSegmentShape>>) => {
    new PermanentFilters(this.props.datamart.organisation_id).updateColumnsVisibility(
      columns
        .map(column => column.key as SegmentsColumnKey)
        .reduce((acc, key) => [...acc, key], [] as SegmentsColumnsList),
    );
    if (this.state.visibleColumns !== columns) {
      this.setState({ visibleColumns: columns });
    }
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

    const realSearch = search || new PermanentFilters(organisationId).getSearch();
    const { hasItems, list } = this.state;

    const filter = parseSearch(realSearch, this.getSearchSetting());

    const searchOptions = {
      placeholder: intl.formatMessage(messages.searchTitle),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
      className: 'mcs-audienceSegmentsTable_search_bar',
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

    const actionColumns: Array<ActionsColumnDefinition<AudienceSegmentShape>> = [
      {
        className: 'mcs-audienceSegmentTable_dropDownMenu',
        key: 'action',
        actions: () => [
          {
            message: intl.formatMessage(messages.editSegment),
            callback: this.editSegment,
            className: 'mcs-audienceSegmentTable_dropDownMenu--edit',
          },
          {
            message: intl.formatMessage(messages.deleteSegment),
            callback: this.deleteSegment,
            className: 'mcs-audienceSegmentTable_dropDownMenu--delete',
          },
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
              id='audience.segments.list.datamartFilter'
              defaultMessage='Datamart'
            />{' '}
            <DownOutlined />
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
            datamartId: datamartItem && datamartItem.key ? datamartItem.key : undefined,
            currentPage: 1,
          });
        },
      };
      filtersOptions.push(datamartFilter);
    }

    const persistedLabel = (persisted: boolean) => {
      return persisted
        ? intl.formatMessage(messageMap.persisted)
        : intl.formatMessage(messageMap.not_persisted);
    };

    const persistedFilter = {
      displayElement: (
        <div className='mcs-audienceSegmentsTable_is_persisted'>
          <span>{intl.formatMessage(messageMap.is_persisted)}</span> <DownOutlined />
        </div>
      ),
      selectedItems: filter.persisted === undefined ? [] : [filter.persisted],
      items: [true, false],
      singleSelectOnly: true,
      getKey: (item: any) => item.toString(),
      display: (item: any) => (item !== undefined ? persistedLabel(item) : ''),
      handleItemClick: (persistedItem: boolean) => {
        const newPersisted =
          filter.persisted !== undefined
            ? JSON.parse(filter.persisted) !== persistedItem
              ? persistedItem
              : undefined
            : persistedItem;
        this.updateLocationSearch({
          persisted: newPersisted,
          currentPage: 1,
        });
      },
    };
    filtersOptions.push(persistedFilter);

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find((filteredLabelId: string) => filteredLabelId === label.id)
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
      buttonMessage: intl.formatMessage(messages.filterByLabel),
      messages: convertMessageDescriptorToString(
        labelSelectorMessages,
        this.props.intl,
      ) as LabelsSelectorMessages,
    };

    return hasItems ? (
      <div className='mcs-table-container mcs-audienceSegmentTable'>
        <TableViewFilters
          columns={this.buildDataColumns()}
          onVisibilityChange={this.onVisibilityChange}
          controlledVisibilitySelectedColumns={this.state.visibleColumns}
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
      <EmptyTableView iconType='data' message={intl.formatMessage(messages.emptySegments)} />
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
  injectNotifications,
  injectFeatures,
  injectDatamart,
  connect(mapStateToProps),
)(AudienceSegmentsTable);
