import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { TableViewFilters } from '../../../../components/TableView';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import messages from './messages';
import { Icon, Modal, Layout, Row } from 'antd';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { Import } from '../../../../models/imports/imports';
import { Link } from 'react-router-dom';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IImportService } from '../../../../services/ImportService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { formatDocumentTypeText, formatMimeTypeText } from "../domain";
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import {
  updateSearch, PaginationSearchSettings,
} from '../../../../utils/LocationSearchHelper';
import DatamartService from '../../../../services/DatamartService';
import { notifyError } from '../../../../state/Notifications/actions';

const { Content } = Layout;

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
  filter: PaginationSearchSettings;
  onFilterChange: (newFilter: Partial<ImportsContentContainerFilter>) => void;
  datamartId: string;
  noFilterDatamart: boolean;
}

type Props = ImportsContentContainerProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

class ImportsContentContainer extends React.Component<Props, ImportsContentContainerState>{
  @lazyInject(TYPES.IImportService)
  private _importService: IImportService;

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
    } = this.props;

    this.setState({
      loading: true,
    });

    const options = {
      allow_administrator: true,
    };

    DatamartService.getDatamarts(organisationId, options)
      .then(res => {
        this.setState({
          datamarts: res.data,
          loading: false
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
        });
        notifyError(err);
      });

    this.fetchImport(datamartId, filter);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      filter,
      datamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      filter: nextFilter,
      datamartId: nextDatamartId,
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    if (organisationId !== nextOrganisationId) {
      DatamartService.getDatamarts(nextOrganisationId)
        .then(res => {
          this.setState({
            datamarts: res.data,
          });
        });
    }

    if (
      (filter !== nextFilter) ||
      (datamartId !== nextDatamartId)
    ) {
      this.fetchImport(nextDatamartId, nextFilter);
    }
  }

  archiveImport = (datamartId: string, importId: string) => {
    return this._importService.deleteImport(datamartId, importId);
  };

  fetchImport = (datamartId: string, filter: PaginationSearchSettings) => {
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

  onClickArchive = (imp: Import) => {
    const {
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
      filter,
      datamartId,
    } = this.props;

    const {
      data
    } = this.state;

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

  render() {
    const {
      match: {
        params: { organisationId },
      },
      filter,
      onFilterChange,
      datamartId,
      noFilterDatamart,
    } = this.props;

    const { data,
      loading,
      datamarts,
    } = this.state;

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

    const datamartItems = datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (datamarts.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
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
      <div className="ant-layout">
        <Content className="mcs-content-container">
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
                filtersOptions={filtersOptions}
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

export default compose<Props, ImportsContentContainerProps>(
  withRouter,
  injectIntl,
)(ImportsContentContainer);