import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { TableViewFilters } from '../../../components/TableView';
import { MultiSelectProps } from '../../../components/MultiSelect';
import messages from './messages';
import queryString from 'query-string';
import { Icon, Modal, Row, } from 'antd';
import { ActionsColumnDefinition } from '../../../components/TableView/TableView';
import { Import } from '../../../models/imports/imports';
import { Link } from 'react-router-dom';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import {
  IImportService,
  GetImportsOptions,
} from '../../../services/ImportService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { formatDocumentTypeText, formatMimeTypeText } from '../domain';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import {
  updateSearch,
  PaginationSearchSettings,
  SearchSetting,
  parseSearch,
  compareSearches,
} from '../../../utils/LocationSearchHelper';
import { IDatamartService } from '../../../services/DatamartService';
import { notifyError } from '../../../redux/Notifications/actions';
import { Index } from '../../../utils';
import { ImportFilterParams } from './ImportsContent';
import { IMPORTS_SEARCH_SETTINGS } from './constants';

interface ImportsContentContainerFilter extends PaginationSearchSettings {
  datamartId: string;
}

interface ImportsContentContainerState {
  loading: boolean;
  data: Import[];
  total: number;
  datamarts: DatamartResource[];
}

export interface ImportsContentContainerProps {
  filter: ImportFilterParams;
  onFilterChange: (newFilter: Partial<ImportsContentContainerFilter>) => void;
  datamartId: string;
  noFilterDatamart: boolean;
}

type Props = ImportsContentContainerProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

class ImportsContentContainer extends React.Component<
  Props,
  ImportsContentContainerState
> {
  @lazyInject(TYPES.IImportService)
  private _importService: IImportService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
      datamarts: [],
    };
  }

  componentDidMount() {
    const {
      datamartId,
      filter,
      match: {
        params: { organisationId },
      },
      noFilterDatamart,
    } = this.props;

    this.setState({
      loading: true,
    });

    const options = {
      allow_administrator: true,
      archived: false,
    };
    if (!noFilterDatamart) {
      this._datamartService.getDatamarts(organisationId, options)
        .then(res => {
          this.setState({
            datamarts: res.data,
            loading: false,
          });
        })
        .catch(err => {
          this.setState({
            loading: false,
          });
          notifyError(err);
        });
    }

    this.fetchImport(datamartId, filter);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      filter,
      datamartId,
      match: {
        params: { organisationId },
      },
      location: { search },
      noFilterDatamart,
    } = this.props;

    const {
      filter: nextFilter,
      datamartId: nextDatamartId,
      match: {
        params: { organisationId: nextOrganisationId },
      },
      location: { search: nextSearch },
    } = nextProps;

    const keywords = queryString.parse(nextSearch).keywords;

    if (
      filter.currentPage !== nextFilter.currentPage ||
      filter.pageSize !== nextFilter.pageSize ||
      filter.keywords !== nextFilter.keywords ||
      datamartId !== nextDatamartId ||
      organisationId !== nextOrganisationId ||
      !compareSearches(search, nextSearch)
    ) {
      const options = {
        allow_administrator: true,
        archived: false,
      };

      const newFilter = {
        ...nextFilter,
        keywords: keywords,
      };
      if (!noFilterDatamart) {
        this._datamartService.getDatamarts(nextOrganisationId, options).then(res => {
          this.setState({
            datamarts: res.data,
          });
        });
      }

      this.fetchImport(nextDatamartId, newFilter);
    }
  }

  deleteImport = (datamartId: string, importId: string) => {
    return this._importService.deleteImport(datamartId, importId);
  };

  fetchImport = (datamartId: string, filter: ImportFilterParams) => {
    this.setState({ loading: true }, () => {
      const options: GetImportsOptions = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      if (filter.keywords) {
        options.keywords = filter.keywords;
      }
      this._importService.getImportList(datamartId, options).then(results => {
        this.setState({
          loading: false,
          data: results.data,
          total: results.total || results.count,
        });
      });
    });
  };

  onClickDelete = (imp: Import) => {
    const {
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
      filter,
      datamartId,
    } = this.props;

    const { data } = this.state;

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.importsDeleteTitle),
      content: formatMessage(messages.importsDeleteMessage),
      okText: formatMessage(messages.importsDeleteOk),
      cancelText: formatMessage(messages.importsDeleteCancel),
      onOk: () => {
        this.deleteImport(imp.datamart_id, imp.id).then(() => {
          if (data.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage ? filter.currentPage - 1 : 1,
            };
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
            return Promise.resolve();
          }
          return this.fetchImport(datamartId, filter);
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
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/datastudio/datamart/${
        imp.datamart_id
      }/imports/${imp.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  getSearchSetting(): SearchSetting[] {
    return [...IMPORTS_SEARCH_SETTINGS];
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

  render() {
    const {
      match: {
        params: { organisationId },
      },
      filter,
      onFilterChange,
      datamartId,
      noFilterDatamart,
      intl,
      location: { search },
    } = this.props;

    const { data, loading, datamarts } = this.state;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<Import>> = [
      {
        key: 'action',
        actions: () => [
          { intlMessage: messages.edit, callback: this.onClickEdit },
          { intlMessage: messages.delete, callback: this.onClickDelete },
        ],
      },
    ];

    const dataColumns = [
      {
        intlMessage: messages.id,
        key: 'id',
        isHideable: false,
        render: (text: string, record: Import) => <span>{text}</span>,
      },
      {
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
        intlMessage: messages.documentType,
        key: 'document_type',
        isHideable: false,
        render: (text: string, record: Import) => (
          <span>{formatDocumentTypeText(text)}</span>
        ),
      },
      {
        intlMessage: messages.priority,
        key: 'priority',
        isHideable: false,
        render: (text: string) => (
          <span>{text}</span>
        ),
      },
      {
        intlMessage: messages.mimeType,
        key: 'mime_type',
        isHideable: false,
        render: (text: string, record: Import) => (
          <span>{formatMimeTypeText(text)}</span>
        ),
      },
    ];

    const datamartItems = datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (datamarts.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage
              id="imports.list.datamartFilter"
              defaultMessage="Datamart"
            />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: [datamartItems.find(di => di.key === datamartId)],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          onFilterChange({
            datamartId:
              datamartItem && datamartItem.key ? datamartItem.key : undefined,
            currentPage: 1,
            pageSize: filter.pageSize,
          });
        },
      };
      if (!noFilterDatamart) {
        filtersOptions.push(datamartFilter);
      }
    }

    const searchFilter = parseSearch(search, this.getSearchSetting());

    const searchOptions = {
      placeholder: intl.formatMessage(messages.searchTitle),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: searchFilter.keywords,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: this.state.total,
      onChange: (page: number, size: number) =>
        onFilterChange({
          currentPage: page,
          pageSize: size,
          datamartId: datamartId,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          currentPage: 1,
          pageSize: size,
          datamartId: datamartId,
        }),
    };

    return (
      <Row className="mcs-table-container">
        <div>
          <div className="mcs-card-header mcs-card-title">
            <span className="mcs-card-title">
              <FormattedMessage {...messages.imports} />
            </span>
          </div>
          <hr className="mcs-separator" />
          <TableViewFilters
            columns={dataColumns}
            actionsColumnsDefinition={actionsColumnsDefinition}
            searchOptions={searchOptions}
            filtersOptions={filtersOptions}
            dataSource={data}
            loading={loading}
            pagination={pagination}
          />
        </div>
      </Row>
    );
  }
}

export default compose<Props, ImportsContentContainerProps>(
  withRouter,
  injectIntl,
)(ImportsContentContainer);
