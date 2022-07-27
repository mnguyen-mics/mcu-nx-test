import * as React from 'react';
import messages from '../messages';
import { FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { IDeviceIdRegistryService } from '../../../../../services/DeviceIdRegistryService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import {
  DeviceIdRegistryOfferResource,
  DeviceIdRegistryResource,
} from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart';

const { Content } = Layout;

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedWorkspaceProps;

interface DeviceIdRegistriesListState {
  isLoadingRegistries: boolean;
  isLoadingRegistryOffers: boolean;
  deviceIdRegistries: DeviceIdRegistryResource[];
  deviceIdRegistryOffers: DeviceIdRegistryOfferResource[];
  total: number;
}

class DeviceIdRegistriesList extends React.Component<Props, DeviceIdRegistriesListState> {
  @lazyInject(TYPES.IDeviceIdRegistryService)
  private _deviceIdRegistryService: IDeviceIdRegistryService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoadingRegistries: false,
      isLoadingRegistryOffers: false,
      deviceIdRegistries: [],
      deviceIdRegistryOffers: [],
      total: 0,
    };
  }

  fetchRegistries = () => {
    const { notifyError } = this.props;

    this.setState({ isLoadingRegistries: true }, () => {
      const options = {
        ...getPaginatedApiParam(1, 500),
      };
      return this._deviceIdRegistryService
        .getDeviceIdRegistries(options)
        .then((results: DataListResponse<DeviceIdRegistryResource>) => {
          this.setState({
            isLoadingRegistries: false,
            deviceIdRegistries: results.data,
            total: results.total || results.count,
          });
          return results;
        })
        .catch(err => {
          this.setState({
            isLoadingRegistries: false,
            deviceIdRegistries: [],
            total: 0,
          });
          notifyError(err);
        });
    });
  };

  fetchRegistryOffers = (organisationId: string) => {
    const { notifyError } = this.props;

    this.setState({ isLoadingRegistryOffers: true }, () => {
      const options = {
        ...getPaginatedApiParam(1, 500),
      };

      const offers = this._deviceIdRegistryService.getDeviceIdRegistryOffers(options);

      const subscribedOffers = this._deviceIdRegistryService.getSubscribedDeviceIdRegistryOffers(
        organisationId,
        options,
      );

      return Promise.all([offers, subscribedOffers])
        .then(res => {
          const offersWithSubscription = res[0].data.map(offer => {
            const offerWithSubscription: DeviceIdRegistryOfferResource = {
              ...offer,
              subscribed: res[1].data.map(subscribedOffer => subscribedOffer.id).includes(offer.id),
            };

            return offerWithSubscription;
          });

          this.setState({
            isLoadingRegistryOffers: false,
            deviceIdRegistryOffers: offersWithSubscription,
            total: res[0].total || res[0].count,
          });
        })
        .catch(err => {
          this.setState({
            isLoadingRegistryOffers: false,
            deviceIdRegistryOffers: [],
            total: 0,
          });
          notifyError(err);
        });
    });
  };

  makeEmptyState = () => {
    this.setState({
      isLoadingRegistries: false,
      isLoadingRegistryOffers: false,
      deviceIdRegistries: [],
      deviceIdRegistryOffers: [],
      total: 0,
    });
  };

  componentDidMount() {
    const {
      workspace: { community_id, organisation_id },
    } = this.props;

    if (organisation_id === community_id) {
      this.fetchRegistries();
      this.fetchRegistryOffers(organisation_id);
    } else {
      this.makeEmptyState();
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    const {
      match: {
        params: { organisationId },
      },
      workspace: { community_id, organisation_id },
    } = this.props;

    if (previousOrganisationId !== organisationId) {
      if (organisation_id === community_id) {
        this.fetchRegistries();
        this.fetchRegistryOffers(organisation_id);
      } else this.makeEmptyState();
    }
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const deviceIdRegistryColumnsDefinition: Array<DataColumnDefinition<DeviceIdRegistryResource>> =
      [
        {
          title: formatMessage(messages.deviceIdRegistryId),
          key: 'id',
          sorter: (a: DeviceIdRegistryResource, b: DeviceIdRegistryResource) =>
            a.id.localeCompare(b.id),
          isHideable: false,
        },
        {
          title: formatMessage(messages.deviceIdRegistryName),
          key: 'name',
          sorter: (a: DeviceIdRegistryResource, b: DeviceIdRegistryResource) =>
            a.name.localeCompare(b.name),
          isHideable: false,
        },
        {
          title: formatMessage(messages.deviceIdRegistryType),
          key: 'type',
          sorter: (a: DeviceIdRegistryResource, b: DeviceIdRegistryResource) =>
            a.type.toString().localeCompare(b.type.toString()),
          isHideable: false,
        },
      ];

    const deviceIdRegistryOfferColumnsDefinition: Array<
      DataColumnDefinition<DeviceIdRegistryOfferResource>
    > = [
      {
        title: formatMessage(messages.deviceIdRegistryOfferId),
        key: 'id',
        sorter: (a: DeviceIdRegistryOfferResource, b: DeviceIdRegistryOfferResource) =>
          a.id.localeCompare(b.id),
        isHideable: false,
      },
      {
        title: formatMessage(messages.deviceIdRegistryOfferName),
        key: 'name',
        sorter: (a: DeviceIdRegistryOfferResource, b: DeviceIdRegistryOfferResource) =>
          a.name.localeCompare(b.name),
        isHideable: false,
      },
      {
        title: formatMessage(messages.deviceIdRegistryType),
        key: 'device_id_registry_type',
        sorter: (a: DeviceIdRegistryOfferResource, b: DeviceIdRegistryOfferResource) =>
          a.device_id_registry_type.toString().localeCompare(b.device_id_registry_type.toString()),
        isHideable: false,
      },
      {
        title: formatMessage(messages.deviceIdRegistryOfferSubscription),
        key: 'subscription',
        sorter: (a: DeviceIdRegistryOfferResource, b: DeviceIdRegistryOfferResource) =>
          a.subscribed.toString().localeCompare(b.subscribed.toString()),
        render: (text: String, record: DeviceIdRegistryOfferResource) => {
          return <span>{record.subscribed ? 'subscribed' : 'not subscribed'}</span>;
        },
      },
    ];

    const tableHeaderComponent = (message: FormattedMessage.MessageDescriptor) => (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...message} />
          </span>
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout mcs-modal_container'>
        <Content className='mcs-content-container'>
          <Row className='mcs-table-container'>
            {tableHeaderComponent(messages.deviceIdRegistries)}
            <TableViewFilters
              pagination={false}
              columns={deviceIdRegistryColumnsDefinition}
              dataSource={this.state.deviceIdRegistries}
              className='mcs-deviceIdRegistriesList_deviceIdRegistrytable'
              loading={this.state.isLoadingRegistries}
            />
          </Row>
          <Row className='mcs-table-container'>
            {tableHeaderComponent(messages.deviceIdRegistryOffers)}
            <TableViewFilters
              pagination={false}
              columns={deviceIdRegistryOfferColumnsDefinition}
              dataSource={this.state.deviceIdRegistryOffers}
              className='mcs-deviceIdRegistryOffersList_deviceIdRegistryOffertable'
              loading={this.state.isLoadingRegistryOffers}
            />
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectNotifications,
  injectIntl,
  injectWorkspace,
)(DeviceIdRegistriesList);
