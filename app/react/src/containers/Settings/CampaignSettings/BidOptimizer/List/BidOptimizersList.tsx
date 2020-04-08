import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Button, Modal, Layout } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { BidOptimizer, PluginProperty } from '../../../../../models/Plugins';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IBidOptimizerService } from '../../../../../services/Library/BidOptimizerService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';

const { Content } = Layout;

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

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class BidOptimizersList extends React.Component<
  Props,
  BidOptimizerContentState
> {
  @lazyInject(TYPES.IBidOptimizerService)
  private _bidOptimizerService: IBidOptimizerService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
    };
  }

  archiveBidOptimizer = (bidOptimizerId: string) => {
    const { notifyError } = this.props;
    return this._bidOptimizerService
      .deleteBidOptimizer(bidOptimizerId)
      .catch(error => {
        notifyError(error);
      });
  };

  fetchBidOptimizersAndProperties = (
    organisationId: string,
    filter: Filters,
  ) => {
    const { notifyError } = this.props;

    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };

      this._bidOptimizerService
        .getBidOptimizers(organisationId, options)
        .then(results => {
          const promises = results.data.map(bo => {
            return this._bidOptimizerService
              .getBidOptimizerProperties(bo.id)
              .then(res => {
                return { ...res.data, id: bo.id };
              });
          });
          Promise.all(promises)
            .then(boProperties => {
              const formattedResults: BidOptimizerInterface[] = [];
              boProperties.forEach((boProperty: any) => {
                const foundBo = results.data.find(
                  bo => bo.id === boProperty.id,
                );

                if (foundBo) {
                  formattedResults.push({
                    ...foundBo,
                    properties: Object.keys(boProperty).map(
                      value => boProperty[value],
                    ),
                  });
                }
              });

              this.setState({
                loading: false,
                data: formattedResults,
                total: results.total || results.count,
              });
            })
            .catch(error => {
              notifyError(error);
              this.setState({
                loading: false,
              });
            });
        });
    });
  };

  onClickArchive = (placement: BidOptimizerInterface) => {
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
          return this.fetchBidOptimizersAndProperties(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (bo: BidOptimizerInterface) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/campaigns/bid_optimizer/${bo.id}/edit`,
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
      BidOptimizerInterface
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
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: BidOptimizerInterface) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/campaigns/bid_optimizer/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
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
      iconType: 'settings',
      intlMessage: messages.empty,
    };

    const onClick = () =>
      history.push(
        `/v2/o/${organisationId}/settings/campaigns/bid_optimizer/create`,
      );

    const buttons = [
      <Button key="create" type="primary" onClick={onClick}>
        <FormattedMessage {...messages.newBidOptimizer} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.bidoptimizer} />
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
            fetchList={this.fetchBidOptimizersAndProperties}
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
  injectNotifications,
)(BidOptimizersList);
