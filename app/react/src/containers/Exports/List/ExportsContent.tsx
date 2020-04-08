import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal, Row } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import {
  GetExportOptions,
  IExportService,
} from '../../../services/Library/ExportService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
  PaginationSearchSettings,
  KeywordSearchSettings,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../utils/LocationSearchHelper';
import { Export } from '../../../models/exports/exports';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../components/TableView/TableView';
import { TableViewFilters } from '../../../components/TableView';
import { Index } from '../../../utils';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { EXPORT_SEARCH_SETTINGS } from './constants';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

export interface ExportFilterParams
  extends PaginationSearchSettings,
    KeywordSearchSettings {}

interface ExportContentState {
  loading: boolean;
  data: Export[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps;

class ExportContent extends React.Component<Props, ExportContentState> {
  state = initialState;

  @lazyInject(TYPES.IExportService)
  private _exportService: IExportService;

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location: { search, pathname },
    } = this.props;

    if (!isSearchValid(search, EXPORT_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EXPORT_SEARCH_SETTINGS),
      });
    } else {
      const filter = parseSearch<ExportFilterParams>(search,EXPORT_SEARCH_SETTINGS);
      this.fetchExport(organisationId, filter);
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
      location: { pathname: nextPathname, search: nextSearch },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, EXPORT_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            EXPORT_SEARCH_SETTINGS,
          ),
        });
      } else {
        const filter = parseSearch<ExportFilterParams>(nextSearch, EXPORT_SEARCH_SETTINGS);
        this.fetchExport(organisationId, filter);
      }
    }
  }

  archiveExport = (exportId: string) => {
    return this._exportService.deleteExport(exportId);
  };

  fetchExport = (organisationId: string, filter: ExportFilterParams) => {
    this.setState({ loading: true }, () => {
      const options: GetExportOptions = {
        organisation_id: organisationId,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      if (filter.keywords) {
        options.keywords = filter.keywords;
      }
      this._exportService.getExports(options).then(results => {
        this.setState({
          loading: false,
          data: results.data,
          total: results.total || results.count,
        });
      });
    });
  };

  onClickArchive = (ex: Export) => {
    const {
      location: { search, pathname, state },
      history,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.exportsArchiveTitle),
      content: formatMessage(messages.exportsArchiveMessage),
      okText: formatMessage(messages.exportsArchiveOk),
      cancelText: formatMessage(messages.exportsArchiveCancel),
      onOk: () => {
        this.archiveExport(ex.id).then(() => {
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
          return this.fetchExport(organisationId, {
            pageSize: filter.pageSize,
            currentPage: filter.currentPage,
            keywords: '',
          });
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (keyword: Export) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(`/${organisationId}/datastudio/exports/${keyword.id}/edit`);
  };

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, EXPORT_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
      location: { search },
    } = this.props;

    const { data, loading } = this.state;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<Export>> = [
      {
        key: 'action',
        actions: () => [
          // { intlMessage: 'EDIT', callback: this.onClickEdit },
          { intlMessage: messages.archive, callback: this.onClickArchive },
        ],
      },
    ];

    const columnsDefinitions = {
      actionsColumnsDefinition,

      dataColumnsDefinition: [
        {
          intlMessage: messages.name,
          key: 'name',
          isHideable: false,
          render: (text: string, record: Export) => (
            <Link
              className="mcs-campaigns-link"
              to={`/v2/o/${organisationId}/datastudio/exports/${record.id}`}
            >
              {text}
            </Link>
          ),
        },
        {
          intlMessage: messages.type,
          key: 'type',
          isHideable: false,
          render: (text: string, record: Export) => <span>{text}</span>,
        },
      ],
    };

    const filter = parseSearch(search, EXPORT_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: intl.formatMessage(messages.searchTitle),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
          pageSize: filter.pageSize,
        }),
      defaultValue: filter.keywords,
    };

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
          currentPage: current,
          pageSize: size,
        }),
    };

    return (
      <Row className="mcs-table-container">
        <div>
          <div className="mcs-card-header mcs-card-title">
            <span className="mcs-card-title">
              <FormattedMessage {...messages.exports} />
            </span>
          </div>
          <hr className="mcs-separator" />
          <TableViewFilters
            columns={columnsDefinitions.dataColumnsDefinition}
            actionsColumnsDefinition={
              columnsDefinitions.actionsColumnsDefinition
            }
            searchOptions={searchOptions}
            dataSource={data}
            loading={loading}
            pagination={pagination}
          />
        </div>
      </Row>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
)(ExportContent);
