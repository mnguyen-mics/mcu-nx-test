import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { TableViewFilters } from '../../../components/TableView';
import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import messages from './messages';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Row } from 'antd';
import { Import } from '../../../models/imports/imports';
import { Link } from 'react-router-dom';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IImportService, GetImportsOptions } from '../../../services/ImportService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { formatDocumentTypeText, formatMimeTypeText } from '../domain';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import {
  updateSearch,
  SearchSetting,
  compareSearches,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  PaginationSearchSettings,
  LabelsSearchSettings,
  KeywordSearchSettings,
} from '../../../utils/LocationSearchHelper';
import { IDatamartService } from '../../../services/DatamartService';
import { notifyError } from '../../../redux/Notifications/actions';
import { Index } from '../../../utils';
import { IMPORTS_SEARCH_SETTINGS } from './constants';
import { connect } from 'react-redux';
import { Label } from '../../Labels/Labels';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

interface MapStateToProps {
  labels: Label[];
}

interface ImportFilterParams
  extends PaginationSearchSettings,
    LabelsSearchSettings,
    KeywordSearchSettings {
  datamartId: string;
}

interface State {
  loading: boolean;
  data: Import[];
  total: number;
  datamarts: DatamartResource[];
}

export interface ImportsContentContainerProps {
  datamartId: string;
  noFilterDatamart: boolean;
}

type Props = ImportsContentContainerProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string; datamartId: string }> &
  InjectedIntlProps;

class ImportsContentContainer extends React.Component<Props, State> {
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
      match: {
        params: { organisationId },
      },
      noFilterDatamart,
      location: { search, pathname },
      history,
    } = this.props;

    this.setState({
      loading: true,
    });

    const options = {
      allow_administrator: true,
      archived: false,
    };

    if (!isSearchValid(search, IMPORTS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, IMPORTS_SEARCH_SETTINGS),
      });
    } else {
      const filter = parseSearch<ImportFilterParams>(search, IMPORTS_SEARCH_SETTINGS);

      if (!noFilterDatamart) {
        this._datamartService
          .getDatamarts(organisationId, options)
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
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId, datamartId },
      },
      location: { search },
      noFilterDatamart,
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
      location: { search: previousSearch },
    } = previousProps;

    const filter = parseSearch<ImportFilterParams>(search, IMPORTS_SEARCH_SETTINGS);

    if (organisationId !== previousOrganisationId || !compareSearches(search, previousSearch)) {
      const options = {
        allow_administrator: true,
        archived: false,
      };

      if (!noFilterDatamart) {
        this._datamartService.getDatamarts(organisationId, options).then(res => {
          this.setState({
            datamarts: res.data,
          });
        });
      }

      this.fetchImport(filter.datamartId || datamartId || this.props.datamartId, filter);
    }
  }

  deleteImport = (datamartId: string, importId: string) => {
    return this._importService.deleteImport(datamartId, importId);
  };

  fetchImport = (datamartId: string, filter: Index<any>) => {
    this.setState({ loading: true }, () => {
      const options: GetImportsOptions = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      if (filter.keywords) {
        options.keywords = filter.keywords;
      }
      if (filter.label_id && filter.label_id.length) {
        options.label_ids = filter.label_id;
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
      datamartId,
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch<ImportFilterParams>(search, IMPORTS_SEARCH_SETTINGS);

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
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
      pathname: `/v2/o/${organisationId}/datastudio/datamart/${imp.datamart_id}/imports/${imp.id}/edit`,
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
      datamartId,
      noFilterDatamart,
      intl: { formatMessage },
      labels,
      location: { search },
    } = this.props;

    const { data, loading, datamarts } = this.state;

    const filter = parseSearch<ImportFilterParams>(search, IMPORTS_SEARCH_SETTINGS);

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<Import>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.edit),
            callback: this.onClickEdit,
          },
          {
            message: formatMessage(messages.delete),
            callback: this.onClickDelete,
          },
        ],
      },
    ];

    const dataColumns: Array<DataColumnDefinition<Import>> = [
      {
        title: formatMessage(messages.id),
        key: 'id',
        isHideable: false,
        render: (text: string, record: Import) => <span>{text}</span>,
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: Import) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/datastudio/datamart/${record.datamart_id}/imports/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.documentType),
        key: 'document_type',
        isHideable: false,
        render: (text: string, record: Import) => <span>{formatDocumentTypeText(text)}</span>,
      },
      {
        title: formatMessage(messages.priority),
        key: 'priority',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        title: formatMessage(messages.mimeType),
        key: 'mime_type',
        isHideable: false,
        render: (text: string, record: Import) => <span>{formatMimeTypeText(text)}</span>,
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
            <FormattedMessage id='imports.list.datamartFilter' defaultMessage='Datamart' />{' '}
            <DownOutlined />
          </div>
        ),
        selectedItems: [datamartItems.find(di => di.key === datamartId)],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.updateLocationSearch({
            datamartId: datamartItem && datamartItem.key ? datamartItem.key : undefined,
            currentPage: 1,
            pageSize: filter.pageSize,
          });
        },
      };
      if (!noFilterDatamart) {
        filtersOptions.push(datamartFilter);
      }
    }

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
          datamartId: datamartId,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
          datamartId: datamartId,
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
      buttonMessage: messages.filterByLabel,
    };

    return (
      <Row className='mcs-table-container'>
        <div>
          <div className='mcs-card-header mcs-card-title'>
            <span className='mcs-card-title'>
              <FormattedMessage {...messages.imports} />
            </span>
          </div>
          <hr className='mcs-separator' />
          <TableViewFilters
            columns={dataColumns}
            actionsColumnsDefinition={actionsColumnsDefinition}
            searchOptions={searchOptions}
            filtersOptions={filtersOptions}
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

export default compose<Props, ImportsContentContainerProps>(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
)(ImportsContentContainer);
