import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { IAttributionModelService } from '../../../../../services/AttributionModelService';
import { Modal, Button, Layout } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { IPluginService } from '../../../../../services/PluginService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { AttributionModel, PluginProperty } from '../../../../../models/Plugins';
import messages from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface AttributionModelInterface extends AttributionModel {
  properties?: PluginProperty[];
}

interface AttributionModelContentState {
  loading: boolean;
  data: AttributionModel[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class AttributionModelsList extends React.Component<
  RouteComponentProps<RouterProps> & WrappedComponentProps,
  AttributionModelContentState
> {
  state = initialState;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  @lazyInject(TYPES.IAttributionModelService)
  private _attributionModelService: IAttributionModelService;

  archiveAttributionModel = (attributionModelId: string) => {
    return this._attributionModelService.deleteAttributionModel(attributionModelId);
  };

  fetchAttributionModel = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._attributionModelService.getAttributionModels(organisationId, options).then(results => {
        const promises = results.data.map(am => {
          return this._pluginService.getEngineProperties(am.attribution_processor_id);
        });
        Promise.all(promises).then(amProperties => {
          const formattedResults = results.data.map((am, i) => {
            return {
              ...am,
              properties: amProperties[i],
            };
          });

          this.setState({
            loading: false,
            data: formattedResults,
            total: results.total || results.count,
          });
        });
      });
    });
  };

  onClickArchive = (placement: AttributionModelInterface) => {
    const {
      location: { pathname, state, search },
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
      title: formatMessage(messages.attributionModelArchiveTitle),
      content: formatMessage(messages.attributionModelArchiveTitle),
      okText: formatMessage(messages.attributionModelArchiveOk),
      cancelText: formatMessage(messages.attributionModelArchiveCancel),
      onOk: () => {
        this.archiveAttributionModel(placement.id).then(() => {
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
          return this.fetchAttributionModel(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (attribution: AttributionModelInterface) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    history.push(
      `/v2/o/${organisationId}/settings/campaigns/attribution_models/${attribution.id}/edit`,
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      history,
      intl: { formatMessage },
    } = this.props;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<AttributionModelInterface>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.edit),
            callback: this.onClickEdit,
          },
          {
            message: formatMessage(messages.archive),
            callback: this.onClickArchive,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<AttributionModelInterface>> = [
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/settings/campaigns/attribution_models/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.engine),
        key: 'id',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => {
          const property =
            record &&
            record.properties &&
            record.properties.find(item => item.technical_name === 'name');
          const render =
            property && property.value && property.value.value ? property.value.value : null;
          return <span>{render}</span>;
        },
      },
      {
        title: formatMessage(messages.miner),
        key: '',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => {
          const property =
            record &&
            record.properties &&
            record.properties.find(item => item.technical_name === 'provider');
          const render =
            property && property.value && property.value.value ? property.value.value : null;
          return <span>{render}</span>;
        },
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.empty),
    };

    const onClick = () =>
      history.push(`/v2/o/${organisationId}/settings/campaigns/attribution_models/create`);

    const buttons = [
      <Button key='create' type='primary' onClick={onClick}>
        <FormattedMessage {...messages.newAttributionModel} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.attributionmodel} />
          </span>
          <span className='mcs-card-button'>{buttons}</span>
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <ItemList
            fetchList={this.fetchAttributionModel}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
          />
        </Content>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl)(AttributionModelsList);
