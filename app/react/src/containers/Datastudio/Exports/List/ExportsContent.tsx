import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal, Layout, Row } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import ExportService, {
  GetExportOptions,
} from '../../../../services/Library/ExportService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
  PaginationSearchSettings,
  KeywordSearchSettings,
  SearchSetting,
  KEYWORD_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';
import { Export } from '../../../../models/exports/exports';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { TableViewFilters } from '../../../../components/TableView';
import { Index } from '../../../../utils';

const { Content } = Layout;

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

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
    } = this.props;
    const { currentPage, pageSize, keywords } = parseSearch(
      search,
      this.getSearchSetting(),
    );
    this.fetchExport(organisationId, {
      currentPage: currentPage || 1,
      pageSize: pageSize || 10,
      keywords: keywords || '',
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
    } = this.props;
    const {
      location: { search: nextSearch },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;
    const { currentPage, pageSize, keywords } = parseSearch(
      search,
      this.getSearchSetting(),
    );
    const {
      currentPage: nextCurrentPage,
      pageSize: nextPageSize,
      keywords: nextKeywords,
    } = parseSearch(nextSearch, this.getSearchSetting());
    if (
      currentPage !== nextCurrentPage ||
      pageSize !== nextPageSize ||
      keywords !== nextKeywords
    ) {
      this.fetchExport(nextOrganisationId, {
        currentPage: nextCurrentPage || 1,
        pageSize: nextPageSize || 10,
        keywords: nextKeywords || '',
      });
    }
  }

  archiveExport = (exportId: string) => {
    return ExportService.deleteExport(exportId);
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
      ExportService.getExports(options).then(results => {
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

  getSearchSetting(): SearchSetting[] {
    return [...KEYWORD_SEARCH_SETTINGS, ...PAGINATION_SEARCH_SETTINGS];
  }

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
      search: updateSearch(currentSearch, params, this.getSearchSetting()),
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
          // { translationKey: 'EDIT', callback: this.onClickEdit },
          { translationKey: 'ARCHIVE', callback: this.onClickArchive },
        ],
      },
    ];

    const columnsDefinitions = {
      actionsColumnsDefinition,

      dataColumnsDefinition: [
        {
          translationKey: 'NAME',
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
          translationKey: 'type',
          intlMessage: messages.type,
          key: 'type',
          isHideable: false,
          render: (text: string, record: Export) => <span>{text}</span>,
        },
      ],
    };

    const filter = parseSearch(search, this.getSearchSetting());

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
      <div className="ant-layout">
        <Content className="mcs-content-container">
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
        </Content>
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
)(ExportContent);
