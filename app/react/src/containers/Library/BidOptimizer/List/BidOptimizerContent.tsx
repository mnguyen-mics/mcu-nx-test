import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal } from 'antd';
import { McsIconType } from '../../../../components/McsIcons';
import ItemList, { Filters } from '../../../../components/ItemList';
import BidOptimizerService from '../../../../services/Library/BidOptimizerService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { BidOptimizer, PluginProperty } from '../../../../models/Plugins';
import messages from './messages';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface BidOptimizerInterface extends BidOptimizer {
  properties?: PluginProperty[];
}

interface BidOptimizerContentState {
  loading: boolean;
  data: BidOptimizer[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class BidOptimizerContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  BidOptimizerContentState
> {
  state = initialState;

  archiveBidOptimizer = (boId: string) => {
    return BidOptimizerService.deleteBidOptimizer(boId);
  };

  fetchBidOptimizer = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      BidOptimizerService.getBidOptimizers(organisationId, options).then(
        results => {
          const promises = results.data.map(bo => {
            return BidOptimizerService.getBidOptimizerProperties(bo.id);
          });
          Promise.all(promises).then(boProperties => {
            const formattedResults: BidOptimizerInterface[] = [];
            boProperties.forEach(boProperty => {
              const foundBo = results.data.find(bo => bo.id === boProperty.id);

              if (foundBo) {
                formattedResults.push({
                  ...foundBo,
                  properties: Object.keys(boProperty).map(
                    (value: any) => boProperty[value],
                  ),
                });
              }
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

  onClickArchive = (placement: BidOptimizerInterface) => {
    const {
      location: { pathname, state, search },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.bidOptimizerArchiveTitle),
      content: formatMessage(messages.bidOptimizerArchiveMessage),
      okText: formatMessage(messages.bidOptimizerArchiveOk),
      cancelText: formatMessage(messages.bidOptimizerArchiveCancel),
      onOk: () => {
        this.archiveBidOptimizer(placement.id).then(() => {
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
          return this.fetchBidOptimizer(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (bo: BidOptimizerInterface) => {
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/library/bid_optimizers/${bo.id}/edit`,
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
        translationKey: 'NAME',
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: BidOptimizerInterface) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/library/bid_optimizers/${
              record.id
            }/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'ENGINE',
        intlMessage: messages.engine,
        key: 'id',
        isHideable: false,
        render: (text: string, record: BidOptimizerInterface) => {
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
        translationKey: 'MINER',
        intlMessage: messages.miner,
        key: 'engine_group_id',
        isHideable: false,
        render: (text: string, record: BidOptimizerInterface) => {
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
        fetchList={this.fetchBidOptimizer}
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

export default compose(withRouter, injectIntl)(BidOptimizerContent);
