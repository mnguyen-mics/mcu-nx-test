import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { IAttributionModelService } from '../../../../../services/AttributionModelService';
import { Modal, Button, Layout } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { IPluginService } from '../../../../../services/PluginService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import {
  AttributionModel,
  PluginProperty,
} from '../../../../../models/Plugins';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';

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
  RouteComponentProps<RouterProps> & InjectedIntlProps,
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
      this._attributionModelService.getAttributionModels(
        organisationId,
        options,
      ).then(results => {
        const promises = results.data.map(am => {
          return this._pluginService.getEngineProperties(
            am.attribution_processor_id,
          );
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
      iconType: 'exclamation-circle',
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
      `/v2/o/${organisationId}/settings/campaigns/attribution_models/${
        attribution.id
      }/edit`,
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const actionsColumnsDefinition: Array<
      ActionsColumnDefinition<AttributionModelInterface>
    > = [
      {
        key: 'action',
        actions: () => [
          { intlMessage: messages.edit, callback: this.onClickEdit },
          { intlMessage: messages.archive, callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/campaigns/attribution_models/${
              record.id
            }/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.engine,
        key: 'id',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => {
          const property =
            record &&
            record.properties &&
            record.properties.find(item => item.technical_name === 'name');
          const render =
            property && property.value && property.value.value
              ? property.value.value
              : null;
          return <span>{render}</span>;
        },
      },
      {
        intlMessage: messages.miner,
        key: '',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => {
          const property =
            record &&
            record.properties &&
            record.properties.find(item => item.technical_name === 'provider');
          const render =
            property && property.value && property.value.value
              ? property.value.value
              : null;
          return <span>{render}</span>;
        },
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.empty,
    };

    const onClick = () =>
      history.push(
        `/v2/o/${organisationId}/settings/campaigns/attribution_models/create`,
      );

    const buttons = [
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newAttributionModel} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.attributionmodel} />
          </span>
          <span className="mcs-card-button">{buttons}</span>
        </div>
        <hr className="mcs-separator" />
      </div>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
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

export default compose(
  withRouter,
  injectIntl,
)(AttributionModelsList);
