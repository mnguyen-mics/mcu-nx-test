import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal } from 'antd';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import RecommenderService from '../../../../services/Library/RecommenderService';
import PluginService from '../../../../services/PluginService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { PluginProperty, Recommender, PluginVersion } from '../../../../models/Plugins';
import messages from './messages';

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

  archiveRecommender = (recommenderId: string) => {
    return RecommenderService.deleteRecommender(recommenderId);
  };

  fetchRecommender = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      RecommenderService.getRecommenders(organisationId, options).then(
        (results: { data: Recommender[]; total?: number; count: number }) => {
          const promises = results.data.map(va => {
            return new Promise((resolve, reject) => {
              PluginService.getEngineVersion(va.version_id)
              .then((recommender: PluginVersion) => {
                return PluginService.getEngineProperties(recommender.id);
              }).then((v: PluginProperty[]) => resolve(v));
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
      match: { params: { organisationId } },
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
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/library/recommenders/${visitAnalyzer.id}/edit`,
    );
  };

  render() {
    const { match: { params: { organisationId } } } = this.props;

    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: [
          { translationKey: 'EDIT', callback: this.onClickEdit },
          { translationKey: 'ARCHIVE', callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        translationKey: 'PROCESSOR',
        intlMessage: messages.processor,
        key: 'name',
        isHideable: false,
        render: (text: string, record: RecommenderInterface) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/library/recommenders/${
              record.id
            }/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'PROVIDER',
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
        translationKey: 'NAME',
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
      iconType: 'library',
      intlMessage: messages.empty,
    };

    return (
      <ItemList
        fetchList={this.fetchRecommender}
        dataSource={this.state.data}
        loading={this.state.loading}
        total={this.state.total}
        columns={dataColumnsDefinition}
        actionsColumnsDefinition={actionsColumnsDefinition}
        pageSettings={PAGINATION_SEARCH_SETTINGS}
        emptyTable={emptyTable}
      />
    );
  }
}

export default compose(withRouter, injectIntl)(RecommenderContent);
