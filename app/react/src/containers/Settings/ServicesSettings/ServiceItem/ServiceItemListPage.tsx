import * as React from 'react';
import { compose } from 'recompose';
import { List, Layout, Row, Col, Breadcrumb, Button } from 'antd';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import {
  GetServiceOptions,
  GetServiceItemsOptions,
  ICatalogService,
} from '../../../../services/CatalogService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import {
  InfiniteList,
  Button as McsButton,
  McsIcon,
  BarChart,
} from '@mediarithmics-private/mcs-components-library';
import {
  InfiniteListFilters,
  InfiniteListMessages,
} from '@mediarithmics-private/mcs-components-library/lib/components/infinite-list';
import {
  ServiceItemShape,
  ServiceItemOfferResource,
  ServiceItemConditionShape,
  isLinearServiceItemConditionsResource,
} from '../../../../models/servicemanagement/PublicServiceItemResource';
import { messages } from '../SubscribedOffers/List/SubscribedOffersListPage';
import ServiceItem from './ServiceItem';
import { offerType } from '../domain';
import { ButtonProps } from 'antd/lib/button';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { Format } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import { convertMessageDescriptorToString, infiniteListMessages } from '../../../../IntlMessages';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';

const { Content } = Layout;

interface ServiceItemListPageProps {
  offerOwnership: offerType;
}

interface State {
  serviceItem?: ServiceItemShape;
  serviceItemCondition?: ServiceItemConditionShape;
  offer?: ServiceItemOfferResource;
  price: string;
}

type Props = ServiceItemListPageProps &
  RouteComponentProps<{ organisationId: string; offerId: string }> &
  WrappedComponentProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps;

class ServiceItemListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  constructor(props: Props) {
    super(props);
    this.state = {
      price: props.intl.formatMessage(messages.serviceItemPricePlaceholder),
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, offerId },
      },
      offerOwnership,
    } = this.props;

    if (offerId) {
      const offerPromise =
        offerOwnership === 'subscribed_offer'
          ? this._catalogService.getSubscribedOffer(organisationId, offerId)
          : this._catalogService.getMyOffer(organisationId, offerId);

      offerPromise.then(resp => {
        this.setState({
          offer: resp.data,
        });
      });
    }
  }

  fetchData = (options: InfiniteListFilters) => {
    const {
      match: {
        params: { organisationId, offerId },
      },
    } = this.props;

    const { offerOwnership } = this.props;
    const fetchOptions: GetServiceOptions = {
      first_result: options.page,
      max_results: options.pageSize,
    };
    const fetchServiceItemOptions: GetServiceItemsOptions = {
      first_result: options.page,
      max_results: options.pageSize,
      offer_id: offerId,
    };

    if (options.keywords) {
      fetchOptions.keywords = options.keywords;
      fetchServiceItemOptions.keywords = options.keywords;
    }

    const serviceItemsPromise =
      offerOwnership === 'subscribed_offer'
        ? this._catalogService.getSubscribedServiceItems(organisationId, offerId, fetchOptions)
        : this._catalogService.getServiceItems(organisationId, fetchServiceItemOptions);

    return serviceItemsPromise
      .then(resp => {
        return resp.data;
      })
      .catch(err => {
        this.props.notifyError(err);
        return [];
      });
  };

  onItemClick = (item: ServiceItemShape) => () => {
    this.storeItemData(item);
  };

  storeItemData = (item: ServiceItemShape) => {
    const { offerOwnership } = this.props;
    this.setState({
      serviceItem: item,
    });
    const {
      match: {
        params: { organisationId, offerId },
      },
      intl,
    } = this.props;

    const serviceItemConditionsPromise =
      offerOwnership === 'subscribed_offer'
        ? this._catalogService.getSubscribedServiceItemConditions(organisationId, offerId, item.id)
        : this._catalogService.getOfferConditions(offerId);

    serviceItemConditionsPromise.then(resp => {
      this.setState({
        serviceItemCondition: resp.data[0],
        price: intl.formatMessage(messages.serviceItemPricePlaceholder),
      });
    });
  };

  getItemTitle = (item: ServiceItemShape) => {
    return item ? item.name : undefined;
  };

  renderItem = (item: ServiceItemShape) => {
    const isItemSelected = item && this.state.serviceItem && item.id === this.state.serviceItem.id;
    return item ? (
      <List.Item
        key={item.id}
        className={isItemSelected ? 'infinite-list-item-selected' : 'infinite-list-item'}
      >
        <McsButton onClick={this.onItemClick(item)} style={{ textAlign: 'left' }}>
          <List.Item.Meta title={this.getItemTitle(item)} />
        </McsButton>
      </List.Item>
    ) : (
      <div />
    );
  };

  render() {
    const { serviceItem, offer, serviceItemCondition } = this.state;
    const {
      match: {
        params: { organisationId, offerId },
      },
      colors,
      intl,
      offerOwnership,
      intl: { formatMessage },
    } = this.props;

    const servicePrice = (usageCost: number) => {
      if (serviceItemCondition && isLinearServiceItemConditionsResource(serviceItemCondition)) {
        return serviceItemCondition.percent_value * usageCost + serviceItemCondition.fixed_value;
      }
      return 0;
    };

    const generateDataSource = () => {
      if (serviceItemCondition && isLinearServiceItemConditionsResource(serviceItemCondition)) {
        const dataSource = [];
        for (const i of [0, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]) {
          dataSource.push({
            usage_price: Math.round(servicePrice(i) * 100) / 100,
            cost: Math.round(Math.log(i) / Math.log(10)),
          });
        }
        return dataSource;
      }
      return undefined;
    };

    const dataset = generateDataSource();

    const priceChart = dataset ? (
      <BarChart
        dataset={dataset}
        xKey={'cost'}
        yKeys={[{ key: 'usage_price', message: formatMessage(messages.usagePrice) }]}
        colors={[colors['mcs-primary']]}
        format={'count' as Format}
      />
    ) : undefined;

    const hasPriceChart = priceChart !== undefined;

    const submitButtonProps: ButtonProps = {
      htmlType: 'submit',
      onClick: () => {
        return null;
      },
      type: 'primary',
    };
    const infiniteListMsg = convertMessageDescriptorToString(
      infiniteListMessages,
      this.props.intl,
    ) as InfiniteListMessages;
    const addedButton =
      offerOwnership === 'my_offer' ? (
        <Link to={`/v2/o/${organisationId}/settings/services/my_offers/${offerId}/edit`}>
          <Button {...submitButtonProps} className='mcs-primary' style={{ float: 'right' }}>
            <McsIcon type='plus' />
            <FormattedMessage {...messages.myServiceOffersEdit} />
          </Button>
        </Link>
      ) : undefined;

    return (
      <div className='ant-layout mcs-service-item-list-page'>
        <Content className='mcs-content-container'>
          <Row className='mcs-table-container'>
            <Breadcrumb className={'mcs-breadcrumb'} separator={<McsIcon type='chevron-right' />}>
              <Breadcrumb.Item>
                <span style={{ lineHeight: '40px' }}>
                  <Link to={`/v2/o/${organisationId}/settings/services/${offerOwnership}s`}>
                    {offerOwnership === 'subscribed_offer'
                      ? intl.formatMessage(messages.subscribedOffersTitle)
                      : intl.formatMessage(messages.myOffersTitle)}
                  </Link>
                </span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span style={{ lineHeight: '40px' }}>
                  {offer ? (
                    <span>{offer.name}</span>
                  ) : (
                    <span>
                      <FormattedMessage {...messages.unknownOffer} />
                    </span>
                  )}
                </span>
                {addedButton}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Row>
          <Row className='mcs-table-container mcs-settings-card' style={{ display: 'flex' }}>
            <Col span={6}>
              <InfiniteList
                fetchData={this.fetchData}
                renderItem={this.renderItem}
                storeItemData={this.storeItemData}
                messages={infiniteListMsg}
              />
            </Col>
            <Col span={18} className='mcs-settings-card-separator'>
              <div className='mcs-card-title service-container-header'>
                {serviceItem && serviceItem.name ? `${serviceItem.name} ` : undefined}
                {serviceItem && serviceItem.type ? `(${serviceItem.type})` : undefined}
              </div>
              <div className='service-container'>
                <ServiceItem
                  serviceItemCondition={serviceItemCondition}
                  serviceItem={serviceItem}
                  hasPriceChart={hasPriceChart}
                />
                <br />
                <br />
                {priceChart}
              </div>
            </Col>
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<Props, ServiceItemListPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectThemeColors,
)(ServiceItemListPage);
