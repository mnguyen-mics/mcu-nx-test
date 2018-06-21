import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Card, Row, Col } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import CatalogService from '../../../../../services/CatalogService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import InfiniteList, {
  InfiniteListFilters,
} from '../../../../../components/InfiniteList';
import { ServiceOfferResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';

const { Content } = Layout;

const messages = defineMessages({
  serviceOffers: {
    id: 'settings.services.subscribed.service.offers.list',
    defaultMessage: 'Subscribed Offers',
  },
});

interface RouterProps {
  organisationId: string;
}

interface State {
  item?: ServiceOfferResource;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class SubscribedOffersListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {}
  }

  fetchOffers = (organisationId: string, options: InfiniteListFilters) => {
    const fecthOptions = {
      first_result: options.page,
      max_results: options.pageSize,
    };
    return CatalogService.getSubscribedOffers(organisationId, fecthOptions);
  };

  onServiceItemSelection = (item: ServiceOfferResource) => () => {
    this.setState({
      item: item,
    });
  };

  getItemKey = (item: ServiceOfferResource) => {
    return item.id
  }

  getItemName = (item: ServiceOfferResource) => {
    return item.name
  }

  render() {
    const { item } = this.state;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Card className="mcs-settings-card-title">
            <div className="mcs-card-title">
              <span className="mcs-card-title">
                <FormattedMessage {...messages.serviceOffers} />
              </span>
            </div>
          </Card>
          <br />
          <Card>
            <Row>
              <Col span={6}>
                <InfiniteList
                  fetchData={this.fetchOffers}
                  onItemClick={this.onServiceItemSelection}
                  getItemKey={this.getItemKey}
                  getItemTitle={this.getItemName}
                />
              </Col>
              <Col span={18}>
                <div>{item ? item.name : undefined}</div>
              </Col>
            </Row>
          </Card>
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
