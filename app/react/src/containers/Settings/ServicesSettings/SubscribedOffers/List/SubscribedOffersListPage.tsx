import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row, Col, Spin } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import CatalogService, {
  GetOfferOptions,
} from '../../../../../services/CatalogService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import InfiniteList, {
  InfiniteListFilters,
} from '../../../../../components/InfiniteList';
import {
  ServiceItemOfferResource,
  ServiceItemConditionsShape,
  ServiceItemShape,
} from '../../../../../models/servicemanagement/PublicServiceItemResource';

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
  offer?: ServiceItemOfferResource;
  serviceItemConditions: ServiceItemConditionsShape[];
  serviceItems: ServiceItemShape[];
  isLoading: boolean;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class SubscribedOffersListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      serviceItemConditions: [],
      serviceItems: [],
      isLoading: false,
    };
  }

  fetchOffers = (organisationId: string, options: InfiniteListFilters) => {
    const fecthOptions: GetOfferOptions = {
      first_result: options.page,
      max_results: options.pageSize,
    };
    if (options.keywords) {
      fecthOptions.keywords = options.keywords;
    }
    return CatalogService.getSubscribedOffers(organisationId, fecthOptions);
  };

  onSubscribedOfferSelection = (offer: ServiceItemOfferResource) => () => {
    this.setState({
      isLoading: true,
    });
    CatalogService.getServiceItemConditions(offer.id)
      .then(resp => {
        this.setState({
          offer: offer,
          serviceItemConditions: resp.data,
          isLoading: false,
        });
      })
      .catch(err => {
        this.setState({
          isLoading: false,
        });
        this.props.notifyError(err);
      });
  };

  getItemKey = (offer: ServiceItemOfferResource) => {
    return offer.id;
  };

  getItemName = (offer: ServiceItemOfferResource) => {
    return offer.name;
  };

  render() {
    const { offer, serviceItemConditions, isLoading } = this.state;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div className="mcs-card-title">
              <FormattedMessage {...messages.serviceOffers} />
            </div>
          </Row>
          <Row className="mcs-table-container mcs-settings-card">
            <Col span={6} className="mcs-settings-card-separator">
              <InfiniteList
                fetchData={this.fetchOffers}
                onItemClick={this.onSubscribedOfferSelection}
                getItemKey={this.getItemKey}
                getItemTitle={this.getItemName}
              />
            </Col>
            <Col span={18}>
              <div className="mcs-card-title service-container-header">
                {offer ? offer.name : undefined}
              </div>
              <div className="service-container">
                {serviceItemConditions.length > 0 || !isLoading ? (
                  serviceItemConditions.map(sic => {
                    return (
                      <div key={sic.id}>
                        <SyntaxHighlighter language="json" style={docco}>
                          {JSON.stringify(sic, undefined, 4)}
                        </SyntaxHighlighter>
                        <br />
                      </div>
                    );
                  })
                ) : (
                  <div className="infinite-loading-container">
                    <Spin />
                  </div>
                )}
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
)(SubscribedOffersListPage);
