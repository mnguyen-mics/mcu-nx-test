import * as React from 'react';
import { compose } from 'recompose';
// import { Link } from 'react-router-dom';
import { Tooltip, Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import CatalogService from '../../../../../services/CatalogService';
// import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { ServiceItemPublicResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';

const { Content } = Layout;

const messages = defineMessages({
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
    id: 'settings.services.items.list.title',
    defaultMessage: 'All Service Items',
  },
  noServiceItemDescription: {
    id: 'settings.services.items.list.no.description',
    defaultMessage: 'No description.',
  },
});

interface State {
  loading: boolean;
  data: ServiceItemPublicResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class ServiceItemsListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
    };
  }

  archiveServiceItem = (serviceItemId: string) => {
    return Promise.resolve();
  };

  fetchServiceItems = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        // allow_administrator: true,
        // getPaginatedApiParam(filter.currentPage, filter.pageSize),

        max_results: 3
      };
      CatalogService.getServices(organisationId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results,
            total: results.length,
          });
        })
        .catch(error => {
          this.setState({ loading: false });
          this.props.notifyError(error);
        });
    });
  };

  onClickEdit = (offer: ServiceItemPublicResource) => {
    //
  };

  render() {
    const { intl } = this.props;
    // const actionsColumnsDefinition = [
    //   {
    //     key: 'action',
    //     actions: [{ translationKey: 'EDIT', callback: this.onClickEdit }],
    //   },
    // ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.serviceItemName,
        key: 'name',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceItemPublicResource) =>
          record.name,
      },
      {
        intlMessage: messages.serviceItemDescription,
        key: 'description',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceItemPublicResource) => (
          <Tooltip placement="top" title={record.description}>
            {record.description
              ? `${record.description.substring(0, 80)}...`
              : intl.formatMessage(messages.noServiceItemDescription)}
          </Tooltip>
        ),
      },
      {
        intlMessage: messages.serviceItemProviderId,
        key: 'provider_id',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceItemPublicResource) =>
          record.provider_id,
      },
      {
        intlMessage: messages.serviceItemInventoryAccessType,
        key: 'inventory_access_type',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceItemPublicResource) =>
          record.inventory_access_type,
      },
      {
        intlMessage: messages.serviceItemType,
        key: 'type',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceItemPublicResource) =>
          record.type,
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.noServiceItems,
    };

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.serviceItems} />
          </span>
        </div>
        <hr className="mcs-separator" />
      </div>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <ItemList
            fetchList={this.fetchServiceItems}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            // actionsColumnsDefinition={actionsColumnsDefinition}
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
)(ServiceItemsListPage);
