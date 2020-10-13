import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import { ICatalogService } from '../../../../../services/CatalogService';
import ItemList, { Filters } from '../../../../../components/ItemList';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { ServiceItemOfferResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import McsIcon, { McsIconType } from '../../../../../components/McsIcon';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';

const { Content } = Layout;

export const messages = defineMessages({
  serviceOffers: {
    id: 'settings.services.subscribed.service.offers.list',
    defaultMessage: 'Subscribed Offers',
  },
  name: {
    id: 'settings.services.subscribed.service.offers.list.column.name',
    defaultMessage: 'Name',
  },
  creditedAccount: {
    id:
      'settings.services.subscribed.service.offers.list.column.credited.account',
    defaultMessage: 'Credited Account',
  },
  providerName: {
    id: 'settings.services.subscribed.service.offers.list.column.provider.name',
    defaultMessage: 'Provider Name',
  },
  empty: {
    id: 'settings.services.subscribed.service.offers.empty.list',
    defaultMessage: 'You have not subscribed to service offers.',
  },
  subscribedOffersTitle: {
    id: 'settings.services.subscribed.service.offers.title',
    defaultMessage: 'Subscribed Offers',
  },
  myOffersTitle: {
    id: 'settings.services.my.service.offers.title',
    defaultMessage: 'My Offers',
  },
  unknownOffer: {
    id: 'settings.services.subscribed.offers.list.unknown.offer',
    defaultMessage: 'Unknown offer',
  },
  addNewCondition: {
    id: 'settings.services.myOffers.add.service_item.condition',
    defaultMessage: 'Add new service item condition',
  },
  serviceItemNoDescription: {
    id: 'settings.subscribedOffers.service.item.no.description.',
    defaultMessage: 'There is no description provided for this service item.',
  },
  serviceItemPriceSimulatorText: {
    id: 'settings.subscribedOffers.service.item.price.simulator.text',
    defaultMessage:
      'In order to simulate your service price, please enter an impression cost value.',
  },
  serviceItemPriceSimulatorInputPlaceholder: {
    id:
      'settings.subscribedOffers.service.item.price.simulator.input.placeholder',
    defaultMessage: 'Usage cost (€)',
  },
  serviceItemPrice: {
    id: 'settings.subscribedOffers.service.item.price',
    defaultMessage: 'Service price:',
  },
  serviceItemPricePlaceholder: {
    id: 'settings.subscribedOffers.service.item.price.placeholder',
    defaultMessage: 'Enter an impression cost to see your service price.',
  },
  invalidImpressionCost: {
    id: 'settings.subscribedOffers.service.item.price.invalid.impression.cost',
    defaultMessage: 'Impression cost is invalid, please use numbers.',
  },
  usagePrice: {
    id: 'settings.subscribedOffers.service.item.price.chart.usage_price',
    defaultMessage: 'Usage Price',
  },
  usageCost: {
    id: 'settings.subscribedOffers.service.item.price.chart.usage_cost',
    defaultMessage: 'Usage Cost',
  },
  myServiceOffersEdit: {
    id: 'settings.myOffers.edit',
    defaultMessage: 'Edit offer',
  }
});

interface RouterProps {
  organisationId: string;
}

interface State {
  data: ServiceItemOfferResource[];
  loading: boolean;
  total: number;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class SubscribedOffersListPage extends React.Component<Props, State> {

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      total: 0,
      loading: false,
    };
  }

  fetchOffers = (organisationId: string, filters: Filters) => {
    this.setState({
      loading: true,
    });
    const options = {
      ...getPaginatedApiParam(filters.currentPage, filters.pageSize),
    };
    this._catalogService.getSubscribedOffers(organisationId, options)
      .then(resp => {
        this.setState({
          loading: false,
          data: resp.data,
          total: resp.total || resp.count,
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
        });
        this.props.notifyError(err);
      });
  };

  render() {
    const { loading, data, total } = this.state;

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const dataColumnsDefinition = [
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/services/subscribed_offers/${
              record.id
              }/service_item_conditions`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.creditedAccount,
        key: 'credited_account_name',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => {
          return <span>{text}</span>;
        },
      },
      {
        intlMessage: messages.providerName,
        key: 'provider_name',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => {
          return <span>{text}</span>;
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

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <Breadcrumb
              className={'mcs-breadcrumb'}
              separator={<McsIcon type="chevron-right" />}
            >
              <Breadcrumb.Item>
                <FormattedMessage {...messages.subscribedOffersTitle} />
              </Breadcrumb.Item>
            </Breadcrumb>
          </Row>
          <ItemList
            fetchList={this.fetchOffers}
            dataSource={data}
            loading={loading}
            total={total}
            columns={dataColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
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
)(SubscribedOffersListPage);
