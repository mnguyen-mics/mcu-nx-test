import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { Layout } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import {
  PAGINATION_SEARCH_SETTINGS,
  ARCHIVED_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import { IDatamartService } from '../../../../../services/DatamartService';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import messages from './messages';
import settingsMessages from '../../../messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import {
  ActionDefinition,
  ActionsColumnDefinition,
  ActionsRenderer,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface DatamartsListPageState {
  loading: boolean;
  data: DatamartResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class DatamartsListPage extends React.Component<
  RouteComponentProps<RouterProps> & WrappedComponentProps & InjectedNotificationProps,
  DatamartsListPageState
> {
  state = initialState;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  archiveUser = (recommenderId: string) => {
    return Promise.resolve();
  };

  fetchDatamarts = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        allow_administrator: true,
        archived: filter.archived,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._datamartService
        .getDatamarts(organisationId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        })
        .catch(error => {
          this.setState({ loading: false });
          this.props.notifyError(error);
        });
    });
  };

  onClickEdit = (datamart: DatamartResource) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/datamart/datamarts/${datamart.id}/edit`);
  };

  onClickSUR = (datamart: DatamartResource) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/datamarts/${datamart.id}/service_usage_report`,
    );
  };

  onClickSources = (datamart: DatamartResource) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/datamart/datamarts/${datamart.id}/sources`);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const renderActionColumnDefinition: ActionsRenderer<DatamartResource> = (
      record: DatamartResource,
    ) => {
      const actionsDefinitions: Array<ActionDefinition<DatamartResource>> = [];
      actionsDefinitions.push({
        message: formatMessage(messages.editDatamart),
        callback: this.onClickEdit,
      });
      if (record.id === '1186') {
        actionsDefinitions.push({
          callback: this.onClickSUR,
          message: formatMessage(messages.serviceUsageReport),
        });
      }
      if (record.type === 'CROSS_DATAMART') {
        actionsDefinitions.push({
          callback: this.onClickSources,
          message: formatMessage(messages.viewDatamartSources),
        });
      }
      return actionsDefinitions;
    };

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<DatamartResource>> = [
      {
        key: 'action',
        actions: renderActionColumnDefinition,
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<DatamartResource>> = [
      {
        title: formatMessage(messages.datamartId),
        key: 'id',
        isHideable: false,
      },
      {
        title: formatMessage(messages.datamartName),
        key: 'name',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: DatamartResource) => (
          <Link to={`/v2/o/${organisationId}/settings/datamart/datamarts/${record.id}`}>
            {value}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.datamartToken),
        key: 'token',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: formatMessage(messages.datamartType),
        key: 'type',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string) =>
          value === 'DATAMART' ? (
            <FormattedMessage {...messages.typeStandard} />
          ) : (
            <FormattedMessage {...messages.typeXDatamart} />
          ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.emptyDatamarts),
    };

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...settingsMessages.datamarts} />
          </span>
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <ItemList
            fetchList={this.fetchDatamarts}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            pageSettings={[...PAGINATION_SEARCH_SETTINGS, ...ARCHIVED_SEARCH_SETTINGS]}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
          />
        </Content>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl, injectNotifications)(DatamartsListPage);
