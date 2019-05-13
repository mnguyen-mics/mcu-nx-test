import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index';
import { NATIVE_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import CreativeScreenshot from '../../CreativeScreenshot';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { Filters } from '../../../../components/ItemList';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { MapStateToProps, MapDispatchToProps } from './NativeListPage';
import CreativeService from '../../../../services/CreativeService';
import {
  ExtendedTableRowSelection,
  ActionsColumnDefinition,
} from '../../../../components/TableView/TableView';
import messagesMap from '../../DisplayAds/List/message';

interface NativeCreativesTableProps
  extends MapStateToProps,
    MapDispatchToProps {
  rowSelection: ExtendedTableRowSelection;
}

interface NativeCreativesTableState {
  modalVisible: boolean;
  inputValue: string[];
  selectedNativeId: string;
}

type JoinedProps = NativeCreativesTableProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

const messages = defineMessages({
  searchPlaceholder: {
    id: 'creative.native.list.searchPlaceholder',
    defaultMessage: 'Search Native Creatives',
  },
});

class NativeCreativesTable extends React.Component<
  JoinedProps,
  NativeCreativesTableState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveNativeCreatives = this.archiveNativeCreatives.bind(this);
    this.editNativeCreatives = this.editNativeCreatives.bind(this);
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
      fetchNativeCreatives,
    } = this.props;

    if (!isSearchValid(search, NATIVE_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, NATIVE_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);
      fetchNativeCreatives(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      history,
      fetchNativeCreatives,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch, state },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, NATIVE_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, NATIVE_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, NATIVE_SEARCH_SETTINGS);
        fetchNativeCreatives(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetNativeCreatives();
  }

  updateLocationSearch(params: Filters) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, NATIVE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  viewTestModal = (template: DisplayAdResource) => {
    this.setState({ modalVisible: true, selectedNativeId: template.id });
  };

  handleCancel = () => {
    this.setState({ modalVisible: false, selectedNativeId: '' });
  };

  render() {
    const {
      location: { search },
      isFetchingNatives,
      dataSource,
      totalNativeCreatives,
      hasNatives,
      rowSelection,
      intl,
    } = this.props;

    const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalNativeCreatives,
      onChange: (page: number) => {
        this.updateLocationSearch({
          currentPage: page,
        });
        if (
          rowSelection &&
          rowSelection.unselectAllItemIds &&
          rowSelection.allRowsAreSelected
        ) {
          rowSelection.unselectAllItemIds();
        }
      },
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messagesMap.preview,
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (
          text: string,
          record: any, // check type
        ) => <CreativeScreenshot item={record} />,
      },
      {
        intlMessage: messagesMap.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: any) => {
          const editLink = () => {
            this.editNativeCreatives(record);
          };

          return (
            <a className="mcs-campaigns-link" onClick={editLink}>
              {text}
            </a>
          );
        },
      },
      {
        intlMessage: messagesMap.auditStatus,
        key: 'audit_status',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messagesMap.publishedVersion,
        key: 'published_version',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<DisplayAdResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messagesMap.edit,
            callback: this.editNativeCreatives,
          },
          {
            intlMessage: messagesMap.archive,
            callback: this.archiveNativeCreatives,
          },
        ],
      },
    ];

    const searchOptions = {
      placeholder: intl.formatMessage(messages.searchPlaceholder),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

    return hasNatives ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          dataSource={dataSource}
          loading={isFetchingNatives}
          pagination={pagination}
          rowSelection={rowSelection}
          searchOptions={searchOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="display" text="EMPTY_NATIVE_CREATIVES" />
    );
  }

  editNativeCreatives(native: DisplayAdResource) {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/creatives/native/edit/${native.id}`,
      state: { from: `${location.pathname}` },
    });
  }

  archiveNativeCreatives(native: DisplayAdResource) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search, pathname, state },
      fetchNativeCreatives,
      dataSource,
      history,
      intl,
    } = this.props;

    const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);

    Modal.confirm({
      title: intl.formatMessage(messagesMap.creativeModalConfirmArchivedTitle),
      content: intl.formatMessage(messagesMap.creativeModalNoArchiveMessage),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messagesMap.creativeModalConfirmArchivedOk),
      cancelText: intl.formatMessage(messagesMap.cancelText),
      onOk() {
        CreativeService.updateDisplayCreative(native.id, {
          ...native,
          archived: true,
        }).then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            fetchNativeCreatives(organisationId, filter, true);
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
          }
          fetchNativeCreatives(organisationId, filter, true);
        });
      },
      onCancel() {
        //
      },
    });
  }
}

export default compose<JoinedProps, NativeCreativesTableProps>(
  withRouter,
  injectIntl,
)(NativeCreativesTable);
