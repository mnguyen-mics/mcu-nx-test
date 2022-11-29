import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { Modal, Button, Layout } from 'antd';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { IPluginService } from '../../../../../services/PluginService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { PluginProperty, Recommender, PluginVersionResource } from '../../../../../models/Plugins';
import messages from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IRecommenderService } from '../../../../../services/Library/RecommenderService';
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

class RecommendersList extends React.Component<
  RouteComponentProps<RouterProps> & WrappedComponentProps,
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
        .then((results: { data: Recommender[]; total?: number; count: number }) => {
          const promises = results.data.map(va => {
            return new Promise((resolve, reject) => {
              this._pluginService
                .getEngineVersion(va.version_id)
                .then((recommender: PluginVersionResource) => {
                  return this._pluginService.getEngineProperties(recommender.id);
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
        });
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
      icon: <ExclamationCircleOutlined />,
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
      intl: { formatMessage },
    } = this.props;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<RecommenderInterface>> = [
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

    const dataColumnsDefinition: Array<DataColumnDefinition<RecommenderInterface>> = [
      {
        title: formatMessage(messages.processor),
        key: 'name',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/settings/campaigns/recommenders/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.provider),
        key: 'id',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => {
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
        title: formatMessage(messages.name),
        key: 'version_id',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => {
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
      history.push(`/v2/o/${organisationId}/settings/campaigns/recommenders/create`);

    const buttons = [
      <Button key='create' type='primary' onClick={onClick}>
        <FormattedMessage {...messages.newRecommender} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.recommender} />
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

export default compose(withRouter, injectIntl)(RecommendersList);
