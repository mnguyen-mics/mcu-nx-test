import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal, Icon } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Filters } from '../../../../components/ItemList';
import { getWorkspace } from '../../../../state/Session/selectors';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
  SearchSetting,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { Import } from '../../../../models/imports/imports';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { IImportService } from '../../../../services/ImportService';
import { TableViewFilters } from '../../../../components/TableView';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import { IMPORTS_SEARCH_SETTINGS } from './constants';
import { Index } from '../../../../utils';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import {formatDocumentTypeText, formatMimeTypeText} from "../domain";

interface ImportContentState {
  loading: boolean;
  data: Import[];
  total: number;
  selectedDatamartId: string;
}

interface RouterProps {
  organisationId: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  MapStateToProps;

class ImportContent extends React.Component<Props, ImportContentState> {
  @lazyInject(TYPES.IImportService)
  private _importService: IImportService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
      selectedDatamartId: props.workspace(props.match.params.organisationId)
        .datamarts[0].id,
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
      history.push({
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
      if (datamartId) {
        this.fetchImport(datamartId, filter);
      } else {
        this.fetchImport(
          this.props.workspace(this.props.match.params.organisationId)
            .datamarts[0].id,
          filter,
        );
      }
    }
  }

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
        const nextFilter = parseSearch(
          nextSearch,
          this.getSearchSetting(nextOrganisationId),
        );
        this.setState({ loading: true });
        if (nextFilter.datamartId) {
          this.fetchImport(nextFilter.datamartId, nextFilter);
        } else {
          this.fetchImport(
            this.props.workspace(this.props.match.params.organisationId)
              .datamarts[0].id,
            nextFilter,
          );
        }
      }
    }
  }

  archiveImport = (datamartId: string, importId: string) => {
    return this._importService.deleteImport(datamartId, importId);
  };

  fetchImport = (datamartId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._importService.getImportList(datamartId, options).then(results => {
        this.setState({
          loading: false,
          data: results.data,
          total: results.total || results.count,
        });
      });
    });
  };

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

  onClickArchive = (imp: Import) => {
    const {
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.importsArchiveTitle),
      content: formatMessage(messages.importsArchiveMessage),
      okText: formatMessage(messages.importsArchiveOk),
      cancelText: formatMessage(messages.importsArchiveCancel),
      onOk: () => {
        this.archiveImport(imp.datamart_id, imp.id).then(() => {
          if (data.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
            return Promise.resolve();
          }
          return this.fetchImport(this.state.selectedDatamartId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (imp: Import) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/datastudio/datamart/${imp.datamart_id}/imports/${
        imp.id
      }/edit`,
    );
  };

  getSearchSetting(organisationId: string): SearchSetting[] {
    return [...IMPORTS_SEARCH_SETTINGS];
  }

  render() {
    const {
      location: { search },
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { data, loading } = this.state;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<Import>> = [
      {
        key: 'action',
        actions: () => [
          { translationKey: 'EDIT', callback: this.onClickEdit },
          { translationKey: 'ARCHIVE', callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumns = [
      {
        translationKey: 'id',
        intlMessage: messages.id,
        key: 'id',
        isHideable: false,
        render: (text: string, record: Import) => <span>{text}</span>,
      },
      {
        translationKey: 'NAME',
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: Import) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/datastudio/datamart/${
              record.datamart_id
            }/imports/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'document_type',
        intlMessage: messages.documentType,
        key: 'document_type',
        isHideable: false,
        render: (text: string, record: Import) => (
          <span>{formatDocumentTypeText(text)}</span>
        ),
      },
      {
        translationKey: 'mime_type',
        intlMessage: messages.mimeType,
        key: 'mime_type',
        isHideable: false,
        render: (text: string, record: Import) => (
          <span>{formatMimeTypeText(text)}</span>
        ),
      },
    ];

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    const statusItems = ['SUCCESS', 'PENDING', 'FAILURE'].map(type => ({
      key: type,
      value: type,
    }));

    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [
      {
        displayElement: (
          <div>
            <FormattedMessage {...messages.filterStatus} /> <Icon type="down" />
          </div>
        ),
        selectedItems: filter.status.map((status: string) => ({
          key: status,
          value: status,
        })),
        items: statusItems,
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
            <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.datamartId
          ? [datamartItems.find(di => di.key === filter.datamartId)]
          : [datamartItems[0]],
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

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: this.state.total,
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

    return (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionsColumnsDefinition}
          filtersOptions={filtersOptions}
          dataSource={data}
          loading={loading}
          pagination={pagination}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
});

export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
)(ImportContent);
