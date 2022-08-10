import * as React from 'react';
import messages from '../messages';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Drawer, Layout, Row } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
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
import DeviceIdRegistriesEditForm from '../Edit/DeviceIdRegistriesEditForm';
import { executeTasksInSequence, Task } from '../../../../../utils/PromiseHelper';

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
  registriesTotal: number;
  offersTotal: number;
  isNewRegistryDrawerVisible: boolean;
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
      registriesTotal: 0,
      offersTotal: 0,
      isNewRegistryDrawerVisible: false,
    };
  }

  fetchRegistries = (communityId: string) => {
    const { notifyError } = this.props;

    this.setState({
      isLoadingRegistries: true,
    });

    const registriesOptions = {
      ...getPaginatedApiParam(1, 500),
    };

    return Promise.all([
      this._deviceIdRegistryService.getDeviceIdRegistries('1', registriesOptions),
      this._deviceIdRegistryService.getDeviceIdRegistries(communityId, registriesOptions),
    ])
      .then((results: DataListResponse<DeviceIdRegistryResource>[]) => {
        const registries = results.reduce((acc: DeviceIdRegistryResource[], val) => {
          return acc.concat(val.data);
        }, []);
        this.setState({
          isLoadingRegistries: false,
          deviceIdRegistries: registries,
          registriesTotal: registries.length,
        });
      })
      .catch(err => {
        this.setState({
          isLoadingRegistries: false,
          deviceIdRegistries: [],
          registriesTotal: 0,
        });
        notifyError(err);
      });
  };

  fetchRegistryOffers = (communityId: string) => {
    const { notifyError } = this.props;

    this.setState({ isLoadingRegistryOffers: true }, () => {
      const offersOptions = {
        ...getPaginatedApiParam(1, 500),
      };

      const offers = this._deviceIdRegistryService.getDeviceIdRegistryOffers(offersOptions);

      const subscribedOffers = this._deviceIdRegistryService.getSubscribedDeviceIdRegistryOffers(
        communityId,
        offersOptions,
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
            offersTotal: res[0].total || res[0].count,
          });
        })
        .catch(err => {
          this.setState({
            isLoadingRegistryOffers: false,
            deviceIdRegistryOffers: [],
            offersTotal: 0,
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
      registriesTotal: 0,
      offersTotal: 0,
    });
  };

  componentDidMount() {
    const {
      workspace: { community_id, organisation_id },
    } = this.props;

    if (organisation_id === community_id) {
      this.fetchRegistries(organisation_id);
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
        this.fetchRegistries(organisation_id);
        this.fetchRegistryOffers(organisation_id);
      } else this.makeEmptyState();
    }
  }

  handleDrawer = (isVisible: boolean) => () => {
    this.setState({
      isNewRegistryDrawerVisible: isVisible,
    });
  };

  saveRegistry = (registry: Partial<DeviceIdRegistryResource>, datamartIds: string[]) => {
    const {
      notifyError,
      notifySuccess,
      intl: { formatMessage },
    } = this.props;

    const datamartSelectiontasks: Task[] = [];

    return this._deviceIdRegistryService
      .createDeviceIdRegistry(registry)
      .then(registryRes => {
        datamartIds.forEach(datamartId =>
          datamartSelectiontasks.push(() =>
            this._deviceIdRegistryService.createDeviceIdRegistryDatamartSelection(
              datamartId,
              registryRes.data.id,
            ),
          ),
        );
        return executeTasksInSequence(datamartSelectiontasks)
          .then(() => {
            this.setState(
              {
                isNewRegistryDrawerVisible: false,
              },
              () => {
                this.refresh();
                notifySuccess({
                  message: formatMessage(messages.newRegistryCreationSuccess),
                  description: '',
                });
              },
            );
            return undefined;
          })
          .catch(err => {
            notifyError(err);
          });
      })
      .catch(err => {
        this.setState({
          isLoadingRegistries: false,
          deviceIdRegistries: [],
          registriesTotal: 0,
        });
        notifyError(err);
      });
  };

  refresh = () => {
    const {
      workspace: { community_id, organisation_id },
    } = this.props;

    if (organisation_id === community_id) {
      this.fetchRegistries(organisation_id);
    } else {
      this.makeEmptyState();
    }
  };

  hasRightToCreateRegistry(): boolean {
    const {
      workspace: { role },
    } = this.props;

    return role === 'COMMUNITY_ADMIN' || role === 'CUSTOMER_ADMIN' || role === 'SUPER_ADMIN';
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const { isNewRegistryDrawerVisible } = this.state;

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
        render: (text: string, record: DeviceIdRegistryOfferResource) => {
          return <span>{record.subscribed ? 'subscribed' : 'not subscribed'}</span>;
        },
      },
    ];

    const newRegistryButton = (
      <span className='mcs-card-button'>
        <Button
          key='create'
          type='primary'
          className='mcs-primary'
          onClick={this.handleDrawer(true)}
        >
          {formatMessage(messages.newDeviceIdRegistry)}
        </Button>
      </span>
    );

    const simpleTableHeader = (
      message: FormattedMessage.MessageDescriptor,
      button?: JSX.Element,
    ) => (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...message} />
          </span>
          {button}
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout mcs-modal_container'>
        <Content className='mcs-content-container'>
          <Drawer
            className='mcs-userEdit_drawer'
            width='800'
            bodyStyle={{ padding: '0' }}
            title={formatMessage(messages.newRegistryDrawerTitle)}
            placement={'right'}
            closable={true}
            onClose={this.handleDrawer(false)}
            visible={isNewRegistryDrawerVisible}
            destroyOnClose={true}
          >
            <DeviceIdRegistriesEditForm save={this.saveRegistry} />
          </Drawer>
          <Row className='mcs-table-container'>
            {simpleTableHeader(
              messages.deviceIdRegistries,
              this.hasRightToCreateRegistry() ? newRegistryButton : undefined,
            )}
            <TableViewFilters
              pagination={false}
              columns={deviceIdRegistryColumnsDefinition}
              dataSource={this.state.deviceIdRegistries}
              className='mcs-deviceIdRegistriesList_deviceIdRegistrytable'
              loading={this.state.isLoadingRegistries}
            />
          </Row>
          <Row className='mcs-table-container'>
            {simpleTableHeader(messages.deviceIdRegistryOffers)}
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
