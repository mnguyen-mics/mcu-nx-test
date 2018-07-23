import * as React from 'react';
import { compose } from 'recompose';
import { List, Layout, Row, Col, Breadcrumb } from 'antd';
// import { docco } from 'react-syntax-highlighter/styles/hljs';
// import SyntaxHighlighter from 'react-syntax-highlighter';
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
  ServiceItemConditionsShape,
  ServiceItemPublicResource,
  ServiceItemOfferResource,
} from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { DataResponse } from '../../../../../services/ApiService';
import { McsIcon } from '../../../../../components';
import { messages } from './SubscribedOffersListPage';

const { Content } = Layout;

export interface Item {
  serviceItem?: ServiceItemShape;
  serviceItemCondition?: ServiceItemConditionsShape;
}

interface State {
  item: Item;
  offer?: ServiceItemOfferResource;
}

type Props = RouteComponentProps<{ organisationId: string; offerId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps;

class ServiceItemListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      item: {},
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
    const promises: Array<
      Promise<DataResponse<ServiceItemPublicResource>>
    > = [];
    return CatalogService.getServiceItemConditionsForOrg(
      organisationId,
      offerId,
      fecthOptions,
    )
      .then(resp => {
        resp.data.map(sic => {
          promises.push(CatalogService.getService(sic.service_item_id));
        });
        return Promise.all(promises).then(res => {
          return res.map(r => {
            return {
              serviceItem: r.data,
              serviceItemCondition: resp.data.find(
                sic => sic.service_item_id === r.data.id,
              ),
            };
          });
        });
      })
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  storeItemData = (item: Item) => {
    this.setState({
      item: {
        serviceItem: item.serviceItem,
        serviceItemCondition: item.serviceItemCondition,
      },
    });
  };

  onItemClick = (item: Item) => () => {
    this.storeItemData(item);
  };

  getItemTitle = (item: Item) => {
    return item.serviceItem ? item.serviceItem.name : undefined;
  };

  renderItem = (item: Item) => {
    const isItemSelected =
      item &&
      item.serviceItem &&
      this.state.item &&
      this.state.item.serviceItem &&
      item.serviceItem.id === this.state.item.serviceItem.id;
    return item && item.serviceItem ? (
      <List.Item
        key={item.serviceItem.id}
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
    const {
      item: { serviceItem /*serviceItemCondition*/ },
      offer,
    } = this.state;

    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

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
                {serviceItem && serviceItem.name ? serviceItem.name : undefined}
              </div>
              <div className="service-container">
              <div className="service-price">0.123 €</div>
                {serviceItem && serviceItem.description
                  ? serviceItem.description
                  : 'No description'}
              </div>

              {/* {serviceItem && (
                <div className="service-container">
                  <SyntaxHighlighter language="json" style={docco}>
                    {JSON.stringify(serviceItem, undefined, 4)}
                  </SyntaxHighlighter>
                </div>
              )}

              {serviceItemCondition && (
                <div className="service-container">
                  <SyntaxHighlighter language="json" style={docco}>
                    {JSON.stringify(serviceItemCondition, undefined, 4)}
                  </SyntaxHighlighter>
                </div>
              )} */}
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
)(ServiceItemListPage);
