import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
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
  PluginProperty,
  Recommender,
  PluginVersionResource,
} from '../../../../../models/Plugins';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IRecommenderService } from '../../../../../services/Library/RecommenderService';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface RecommenderInterface extends Recommender {
  properties?: PluginProperty[];
}

interface RecommenderContentState {
  loading: boolean;
  data: Recommender[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class RecommenderContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  RecommenderContentState
> {
  state = initialState;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  @lazyInject(TYPES.IRecommenderService)
  private _recommenderService: IRecommenderService;

  archiveRecommender = (recommenderId: string) => {
    return this._recommenderService.deleteRecommender(recommenderId);
  };

  fetchRecommender = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._recommenderService
        .getRecommenders(organisationId, options)
        .then(
          (results: { data: Recommender[]; total?: number; count: number }) => {
            const promises = results.data.map(va => {
              return new Promise((resolve, reject) => {
                this._pluginService
                  .getEngineVersion(va.version_id)
                  .then((recommender: PluginVersionResource) => {
                    return this._pluginService.getEngineProperties(
                      recommender.id,
                    );
                  })
                  .then((v: PluginProperty[]) => resolve(v));
              });
            });
            Promise.all(promises).then((vaProperties: PluginProperty[]) => {
              const formattedResults: any = results.data.map((va, i) => {
                return {
                  ...va,
                  properties: vaProperties[i],
                };
              });
              this.setState({
                loading: false,
                data: formattedResults,
                total: results.total || results.count,
              });
            });
          },
        );
    });
  };

  onClickArchive = (visitAnalyzer: RecommenderInterface) => {
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
      title: formatMessage(messages.recommenderArchiveTitle),
      content: formatMessage(messages.recommenderArchiveMessage),
      okText: formatMessage(messages.recommenderArchiveOk),
      cancelText: formatMessage(messages.recommenderArchiveCancel),
      onOk: () => {
        this.archiveRecommender(visitAnalyzer.id).then(() => {
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
          return this.fetchRecommender(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (visitAnalyzer: RecommenderInterface) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/campaigns/recommenders/${visitAnalyzer.id}/edit`,
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<
      RecommenderInterface
    >> = [
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
        intlMessage: messages.processor,
        key: 'name',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/campaigns/recommenders/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.provider,
        key: 'id',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => {
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
        intlMessage: messages.name,
        key: 'version_id',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => {
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
        `/v2/o/${organisationId}/settings/campaigns/recommenders/create`,
      );

    const buttons = [
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newRecommender} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.recommender} />
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
            fetchList={this.fetchRecommender}
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

export default compose(withRouter, injectIntl)(RecommenderContent);
