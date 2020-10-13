import React, { Component } from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal, Button, Layout } from 'antd';
import McsIcon, { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import messages from './messages';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { MlFunctionResource } from '../../../../../models/datamart/MlFunction';
import { IMlFunctionService } from '../../../../../services/MlFunctionService';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IPluginService } from '../../../../../services/PluginService';

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

interface MlFunction extends MlFunctionResource {
  id: string;
  artifact_id: string;
  name: string;
  group_id: string;
  version_id: string;
  version_value: string;
  visit_analyzer_plugin_id: string;
  organisation_id: string;
  properties?: PluginProperty[];
}

interface MlFunctionsContentState {
  loading: boolean;
  data: MlFunction[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class MlFunctionsContent extends Component<
  Props,
  MlFunctionsContentState
  > {
  @lazyInject(TYPES.IMlFunctionService)
  private _mlFunctionService: IMlFunctionService;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);
    this.state = initialState;
  }

  archiveMlFunction = (mlFunctionService: string) => {
    return Promise.resolve()
  };

  fetchMlFunctions = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._mlFunctionService.listMlFunctions(organisationId, options).then(
        (results) => {
          const promises = results.data.map(sp => {
            return new Promise((resolve, reject) => {
              this._pluginService.getEngineVersion(sp.version_id)
                .then(mlFunction => {
                  return this._pluginService.getEngineProperties(mlFunction.id);
                })
                .then(v => resolve(v));
            });
          });
          Promise.all(promises).then((spProperties: PluginProperty[]) => {
            const formattedResults: any = results.data.map((va, i) => {
              return {
                ...va,
                properties: spProperties[i],
              };
            });
            this.setState({
              loading: false,
              data: formattedResults,
              total: results.total || results.count,
            });
          });
        })
        .catch(err => {
          this.props.notifyError(err);
          this.setState({ loading: false });
        });
    });
  };

  onClickArchive = (mlFunction: MlFunction) => {
    const {
      location: { search, state, pathname },
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
      title: formatMessage(messages.mlFunctionArchiveTitle),
      content: formatMessage(messages.mlFunctionArchiveMessage),
      okText: formatMessage(messages.mlFunctionArchiveOk),
      cancelText: formatMessage(messages.mlFunctionArchiveCancel),
      onOk: () => {
        this.archiveMlFunction(mlFunction.id).then(() => {
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
          return this.fetchMlFunctions(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (mlFunction: MlFunction) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/ml_functions/${
      mlFunction.id
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
      ActionsColumnDefinition<MlFunction>
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
        key: 'status',
        isHideable: false,
        render: (text: string, record: MlFunction) => (
          <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
            <McsIcon type="status" />
          </span>
        ),
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: MlFunction) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/datamart/ml_functions/${
              record.id
              }/edit`}
          >
            {text}
          </Link>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.empty)
    };

    const onClick = () =>
      history.push(
        `/v2/o/${organisationId}/settings/datamart/ml_functions/create`,
      );

    const buttons = [
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newMlFunction} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.mlFunction} />
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
            fetchList={this.fetchMlFunctions}
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

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications
)(MlFunctionsContent);
