import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Modal, Row } from 'antd';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { GetExportOptions, IExportService } from '../../../services/Library/ExportService';
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
  LabelsSearchSettings,
} from '../../../utils/LocationSearchHelper';
import { Export } from '../../../models/exports/exports';
import messages from './messages';
import { Index } from '../../../utils';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { EXPORT_SEARCH_SETTINGS } from './constants';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { Label } from '../../Labels/Labels';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { LabelsSelectorMessages } from '@mediarithmics-private/mcs-components-library/lib/components/labels-selector';
import { convertMessageDescriptorToString, labelSelectorMessages } from '../../../IntlMessages';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface ExportFilterParams
  extends PaginationSearchSettings,
    LabelsSearchSettings,
    KeywordSearchSettings {}

interface ExportContentState {
  loading: boolean;
  data: Export[];
  total: number;
}

interface MapStateToProps {
  labels: Label[];
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> & WrappedComponentProps & MapStateToProps;

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
      const filter = parseSearch<ExportFilterParams>(search, EXPORT_SEARCH_SETTINGS);
      this.fetchExport(organisationId, filter);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, EXPORT_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, EXPORT_SEARCH_SETTINGS),
        });
      } else {
        const filter = parseSearch<ExportFilterParams>(search, EXPORT_SEARCH_SETTINGS);
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
      if (filter.label_id && filter.label_id.length) {
        options.label_ids = filter.label_id;
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
      icon: <ExclamationCircleOutlined />,
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
            label_id: [],
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
      intl: { formatMessage },
      location: { search },
      labels,
    } = this.props;

    const { data, loading } = this.state;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<Export>> = [
      {
        key: 'action',
        actions: () => [
          // { intlMessage: 'EDIT', callback: this.onClickEdit },
          {
            message: formatMessage(messages.archive),
            callback: this.onClickArchive,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<Export>> = [
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: Export) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/datastudio/exports/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.type),
        key: 'type',
        isHideable: false,
        render: (text: string, record: Export) => <span>{text}</span>,
      },
    ];

    const filter = parseSearch(search, EXPORT_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: formatMessage(messages.searchTitle),
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

    const labelsOptions = {
      labels: labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.some((filteredLabelId: string) => filteredLabelId === label.id);
      }),
      onChange: (newLabels: Label[]) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({
          label_id: formattedLabels,
          currentPage: 1,
        });
      },
      buttonMessage: formatMessage(messages.filterByLabel),
      messages: convertMessageDescriptorToString(
        labelSelectorMessages,
        this.props.intl,
      ) as LabelsSelectorMessages,
    };

    return (
      <Row className='mcs-table-container'>
        <div>
          <div className='mcs-card-header mcs-card-title'>
            <span className='mcs-card-title'>
              <FormattedMessage {...messages.exports} />
            </span>
          </div>
          <hr className='mcs-separator' />
          <TableViewFilters
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            searchOptions={searchOptions}
            dataSource={data}
            loading={loading}
            pagination={pagination}
            labelsOptions={labelsOptions}
          />
        </div>
      </Row>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  labels: state.labels.labelsApi.data,
});

export default compose(withRouter, injectIntl, connect(mapStateToProps))(ExportContent);
