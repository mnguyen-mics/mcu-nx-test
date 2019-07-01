import React, { Component } from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal, Button, Layout } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import PluginService from '../../../../../services/PluginService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import messages from './messages';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { StoredProcedureResource } from '../../../../../models/datamart/StoredProcedure';
import { IStoredProcedureService } from '../../../../../services/StoredProcedureService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';

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

interface StoredProcedure extends StoredProcedureResource {
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

interface StoredProceduresContentState {
  loading: boolean;
  data: StoredProcedure[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedNotificationProps

class StoredProceduresContent extends Component<
  Props,
  StoredProceduresContentState
> {

  @lazyInject(TYPES.IStoredProcedureService)
  private _storedProcedureService: IStoredProcedureService;

  constructor(props: Props) {
    super(props);
    this.state = initialState
  }

  archiveStoredProcedure = (storedProcedureService: string) => {
    return Promise.resolve()
  };

  fetchStoredProdecure = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._storedProcedureService.listStoredProcedure(options).then(
        (results: { data: StoredProcedureResource[]; total?: number; count: number }) => {
          const promises = results.data.map(sp => {
            return new Promise((resolve, reject) => {
              PluginService.getEngineVersion(sp.version_id)
                .then(storedProcedure => {
                  return PluginService.getEngineProperties(storedProcedure.id);
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
        },
      )
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ loading: false })
      });
    });
  };

  onClickArchive = (storedProcedure: StoredProcedure) => {
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
      title: formatMessage(messages.storedProcedureArchiveTitle),
      content: formatMessage(messages.storedProcedureArchiveMessage),
      okText: formatMessage(messages.storedProcedureArchiveOk),
      cancelText: formatMessage(messages.storedProcedureArchiveCancel),
      onOk: () => {
        this.archiveStoredProcedure(storedProcedure.id).then(() => {
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
          return this.fetchStoredProdecure(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (visitAnalyzer: StoredProcedure) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/visit_analyzers/${
        visitAnalyzer.id
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
      ActionsColumnDefinition<StoredProcedure>
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
        render: (text: string, record: StoredProcedure) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/datamart/visit_analyzers/${
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
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.empty,
    };

    const onClick = () =>
      history.push(
        `/v2/o/${organisationId}/settings/datamart/visit_analyzers/create`,
      );

    const buttons = [
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newStoredProcedure} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.storedProcedure} />
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
            fetchList={this.fetchStoredProdecure}
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
)(StoredProceduresContent);
