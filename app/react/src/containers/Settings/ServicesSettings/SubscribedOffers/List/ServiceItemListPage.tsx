import * as React from 'react';
import { compose } from 'recompose';
import { List, Layout, Row, Col, Spin } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Link } from 'react-router-dom';
import { docco } from 'react-syntax-highlighter/styles/hljs';
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

  onItemClick = (item: Item) => {
    this.setState({
      item: {
        serviceItem: item.serviceItem,
        serviceItemCondition: item.serviceItemCondition,
      },
    });
  };

  getItemTitle = (item: Item) => {
    return item.serviceItem ? item.serviceItem.name : undefined;
  };

  renderItem = (item: Item) => {
    return item && item.serviceItem ? (
      <List.Item key={item.serviceItem.id}>
        <ButtonStyleless
          onClick={this.onItemClick}
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
      item: { serviceItem, serviceItemCondition },
      offer,
    } = this.state;

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div className="mcs-card-title">
              <Link
                to={`/v2/o/${organisationId}/settings/services/subscribed_offers`}
              >
                {offer ? offer.name : <Spin />}
              </Link>
              {serviceItem ? ` > ${serviceItem.name}` : undefined}
            </div>
          </Row>
          <Row className="mcs-table-container mcs-settings-card">
            <Col span={6}>
              <InfiniteList
                fetchData={this.fetchData}
                renderItem={this.renderItem}
                onItemClick={this.onItemClick}
              />
            </Col>
            <Col span={18} className="mcs-settings-card-separator">
              <div className="mcs-card-title service-container-header">
                {serviceItem && serviceItem.name ? serviceItem.name : undefined}
              </div>

              {serviceItem && (
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
              )}
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
