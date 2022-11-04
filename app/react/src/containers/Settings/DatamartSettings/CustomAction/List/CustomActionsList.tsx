import React, { Component } from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Button, Layout } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { IPluginService } from '../../../../../services/PluginService';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import messages from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { ICustomActionService } from '../../../../../services/CustomActionService';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface PluginProperty {
  deletable: boolean;
  origin: string;
  property_type: string;
  technical_name: string;
  value: any;
  writable: boolean;
}

interface CustomAction {
  id: string;
  artifact_id: string;
  name: string;
  group_id: string;
  version_id: string;
  organisation_id: string;
  properties?: PluginProperty[];
}

interface CustomActionContentState {
  loading: boolean;
  data: CustomAction[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class CustomActionsList extends Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  CustomActionContentState
> {
  state = initialState;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  @lazyInject(TYPES.ICustomActionService)
  private _customActionService: ICustomActionService;

  archiveCustomAction = (customActionId: string) => {
    return this._customActionService.deleteInstanceById(customActionId);
  };

  fetchCustomAction = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._customActionService
        .getInstances({ organisation_id: organisationId, ...options })
        .then((results: { data: CustomAction[]; total?: number; count: number }) => {
          const promises = results.data.map(ca => {
            return new Promise((resolve, reject) => {
              this._pluginService
                .getEngineVersion(ca.version_id)
                .then(customAction => {
                  return this._pluginService.getEngineProperties(customAction.id);
                })
                .then(v => resolve(v));
            });
          });
          Promise.all(promises).then((caProperties: PluginProperty[]) => {
            const formattedResults: any = results.data.map((va, i) => {
              return {
                ...va,
                properties: caProperties[i],
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

  onClickEdit = (customAction: CustomAction) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/custom_actions/${customAction.id}/edit`,
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

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<CustomAction>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.edit),
            callback: this.onClickEdit,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<CustomAction>> = [
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: CustomAction) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/settings/datamart/custom_actions/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.provider),
        key: 'id',
        isHideable: false,
        render: (text: string, record: CustomAction) => {
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
      history.push(`/v2/o/${organisationId}/settings/datamart/custom_actions/create`);

    const buttons = [
      <Button
        key='create'
        type='primary'
        className='mcs-CustomActionsList_creation_button'
        onClick={onClick}
      >
        <FormattedMessage {...messages.newCustomAction} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.customAction} />
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
            fetchList={this.fetchCustomAction}
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

export default compose(withRouter, injectIntl)(CustomActionsList);
