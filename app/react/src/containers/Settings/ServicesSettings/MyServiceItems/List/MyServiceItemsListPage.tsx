import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row, Col } from 'antd';
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
  GetServiceOptions,
} from '../../../../../services/CatalogService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import InfiniteList, {
  InfiniteListFilters,
} from '../../../../../components/InfiniteList';
import { ServiceItemPublicResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';

const { Content } = Layout;

const messages = defineMessages({
  myServiceItemsTitle: {
    id: 'settings.services.items.list.title',
    defaultMessage: 'My Service Items',
  },
  serviceItemVersion: {
    id: 'settings.services.items.list.column.version',
    defaultMessage: 'Version',
  },
  serviceItemProviderId: {
    id: 'settings.services.items.list.column.provider.id',
    defaultMessage: 'Prov. Id',
  },
  serviceItemName: {
    id: 'settings.services.items.list.column.name',
    defaultMessage: 'Name',
  },
  serviceItemDescription: {
    id: 'settings.services.items.list.column.description',
    defaultMessage: 'Description',
  },
  serviceItemInventoryAccessType: {
    id: 'settings.services.items.list.column.inventory.access.type',
    defaultMessage: 'Inventory Access Type',
  },
  serviceItemType: {
    id: 'settings.services.items.list.column.type',
    defaultMessage: 'Type',
  },
  serviceItemDisplayNetworkId: {
    id: 'settings.services.items.list.column.display-network_id',
    defaultMessage: 'Display Network Id',
  },
  noServiceItems: {
    id: 'settings.services.items.list.no.items',
    defaultMessage: 'No Service Items',
  },
  serviceItems: {
    id: 'settings.all.services.items.list.title',
    defaultMessage: 'All Service Items',
  },
  noServiceItemDescription: {
    id: 'settings.services.items.list.no.description',
    defaultMessage: 'No description.',
  },
});

interface RouterProps {
  organisationId: string;
}

interface State {
  item?: ServiceItemPublicResource;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class ServiceItemsListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  archiveServiceItem = (serviceItemId: string) => {
    return Promise.resolve();
  };

  fetchServiceItems = (
    organisationId: string,
    options: InfiniteListFilters,
  ) => {
    const fecthOptions: GetServiceOptions = {
      first_result: options.page,
      max_results: options.pageSize,
    };
    if (options.keywords) {
      fecthOptions.keywords = options.keywords;
    }
    return CatalogService.getServices(organisationId, fecthOptions);
  };

  onServiceItemSelection = (item: ServiceItemPublicResource) => () => {
    this.setState({
      item: item,
    });
  };

  getItemKey = (item: ServiceItemPublicResource) => {
    return item.id;
  };

  getItemName = (item: ServiceItemPublicResource) => {
    return item.name;
  };

  render() {
    const { item } = this.state;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div className="mcs-card-title">
              <FormattedMessage {...messages.myServiceItemsTitle} />
            </div>
          </Row>
          <Row className="mcs-table-container mcs-settings-card">
            <Col span={6} className="mcs-settings-card-separator">
              <InfiniteList
                fetchData={this.fetchServiceItems}
                onItemClick={this.onServiceItemSelection}
                getItemKey={this.getItemKey}
                getItemTitle={this.getItemName}
              />
            </Col>
            <Col span={18}>
              <div className="mcs-card-title service-container-header">
                {item ? item.name : undefined}
              </div>
              <div className="service-container">
                {item && (
                  <SyntaxHighlighter language="json" style={docco}>
                    {JSON.stringify(item, undefined, 4)}
                  </SyntaxHighlighter>
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
)(ServiceItemsListPage);
