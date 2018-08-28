import * as React from 'react';
import { compose } from 'recompose';
import { List, Layout, Row, Col, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router';
import ButtonStyleless from '../../../../../components/ButtonStyleless';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import CatalogService, {
  GetServiceOptions,
} from '../../../../../services/CatalogService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import InfiniteList, {
  InfiniteListFilters,
} from '../../../../../components/InfiniteList';
import {
  ServiceItemShape,
  ServiceItemOfferResource,
  ServiceItemConditionsShape,
  isLinearServiceItemConditionsResource,
} from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { McsIcon } from '../../../../../components';
import { messages } from './SubscribedOffersListPage';
import { StackedLinePlot } from '../../../../../components/StackedAreaPlot';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import ServiceItem from './ServiceItem';

const { Content } = Layout;

const ServiceItemPriceChartJS = StackedLinePlot as any;

interface State {
  serviceItem?: ServiceItemShape;
  serviceItemCondition?: ServiceItemConditionsShape;
  offer?: ServiceItemOfferResource;
  price: string;
}

type Props = RouteComponentProps<{ organisationId: string; offerId: string }> &
  InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps;

class ServiceItemListPage extends React.Component<Props, State> {
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
    } = this.props;
    if (offerId) {
      CatalogService.getSubscribedOffer(organisationId, offerId).then(resp => {
        this.setState({
          offer: resp.data[0],
        });
      });
    }
  }

  fetchData = (
    organisationId: string,
    offerId: string,
    options: InfiniteListFilters,
  ) => {
    const fecthOptions: GetServiceOptions = {
      first_result: options.page,
      max_results: options.pageSize,
    };
    if (options.keywords) {
      fecthOptions.keywords = options.keywords;
    }

    return CatalogService.getSubscribedServiceItems(
      organisationId,
      offerId,
      fecthOptions,
    )
      .then(resp => {
        return resp.data;
      })
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  onItemClick = (item: ServiceItemShape) => () => {
    this.storeItemData(item);
  };

  storeItemData = (item: ServiceItemShape) => {
    this.setState({
      serviceItem: item,
    });
    const {
      match: {
        params: { organisationId, offerId },
      },
      intl,
    } = this.props;
    CatalogService.getSubscribedServiceItemConditions(
      organisationId,
      offerId,
      item.id,
    ).then(resp => {
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
    const isItemSelected =
      item && this.state.serviceItem && item.id === this.state.serviceItem.id;
    return item ? (
      <List.Item
        key={item.id}
        className={
          isItemSelected ? 'infinite-list-selected-item' : 'infinite-list-item'
        }
      >
        <ButtonStyleless
          onClick={this.onItemClick(item)}
          style={{ textAlign: 'left' }}
        >
          <List.Item.Meta title={this.getItemTitle(item)} />
        </ButtonStyleless>
      </List.Item>
    ) : (
      <div />
    );
  };

  render() {
    const { serviceItem, offer, serviceItemCondition } = this.state;

    const {
      match: {
        params: { organisationId },
      },
      colors,
      intl,
    } = this.props;

    const optionsForChart = {
      xKey: ['cost'],
      xLabel: intl.formatMessage(messages.usageCost),
      yKeys: [{ key: 'usage_price', message: messages.usagePrice }],
      colors: [colors['mcs-primary']],
    };

    const servicePrice = (usageCost: number) => {
      if (
        serviceItemCondition &&
        isLinearServiceItemConditionsResource(serviceItemCondition)
      ) {
        return (
          serviceItemCondition.percent_value * usageCost +
          serviceItemCondition.fixed_value
        );
      }
      return 0;
    };

    const generateDataSource = () => {
      if (
        serviceItemCondition &&
        isLinearServiceItemConditionsResource(serviceItemCondition)
      ) {
        const dataSource = [];
        for (const i of [
          0,
          10,
          100,
          1000,
          10000,
          100000,
          1000000,
          10000000,
          100000000,
        ]) {
          dataSource.push({
            usage_price: Math.round(servicePrice(i) * 100) / 100,
            cost: Math.round(Math.log(i) / Math.log(10)),
          });
        }
        return dataSource;
      }
      return [{ usage_price: 0, cost: 0 }];
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
                <Link
                  to={`/v2/o/${organisationId}/settings/services/subscribed_offers`}
                >
                  {intl.formatMessage(messages.subscribedOffersTitle)}
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {offer ? offer.name : intl.formatMessage(messages.unknownOffer)}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Row>
          <Row className="mcs-table-container mcs-settings-card">
            <Col span={6}>
              <InfiniteList
                fetchData={this.fetchData}
                renderItem={this.renderItem}
                storeItemData={this.storeItemData}
              />
            </Col>
            <Col span={18} className="mcs-settings-card-separator">
              <div className="mcs-card-title service-container-header">
                {serviceItem && serviceItem.name
                  ? `${serviceItem.name} `
                  : undefined}
                {serviceItem && serviceItem.type
                  ? `(${serviceItem.type})`
                  : undefined}
              </div>
              <div className="service-container">
                <ServiceItem
                  serviceItemCondition={serviceItemCondition}
                  serviceItem={serviceItem}
                />
                <br />
                <br />
                <ServiceItemPriceChartJS
                  identifier="servicePriceChart"
                  dataset={generateDataSource()}
                  options={optionsForChart}
                />
              </div>
            </Col>
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  injectThemeColors,
)(ServiceItemListPage);
