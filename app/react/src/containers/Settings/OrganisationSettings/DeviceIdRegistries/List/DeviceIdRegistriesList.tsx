import * as React from 'react';
import messages from '../messages';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Drawer, Layout, Modal, Row, Tooltip } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
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
  DeviceIdRegistryDatamartSelectionResource,
  DeviceIdRegistryOfferResource,
  DeviceIdRegistryResource,
  DeviceIdRegistryType,
} from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart';
import DeviceIdRegistriesEditForm from '../Edit/DeviceIdRegistriesEditForm';
import DeviceIdRegistryDatamartSelectionsEditForm from '../Edit/DeviceIdRegistryDatamartSelectionsEditForm';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons/lib/icons';
import { executeTasksInSequence, Task } from '../../../../../utils/PromiseHelper';

const { Content } = Layout;

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedWorkspaceProps;

interface DeviceIdRegistryWithDatamartSelectionsResource extends DeviceIdRegistryResource {
  datamart_selections: DeviceIdRegistryDatamartSelectionResource[];
}

interface DeviceIdRegistriesListState {
  isLoadingRegistries: boolean;
  isLoadingRegistryOffers: boolean;
  firstPartyDeviceIdRegistries: DeviceIdRegistryWithDatamartSelectionsResource[];
  deviceIdRegistryOffers: DeviceIdRegistryOfferResource[];
  registriesTotal: number;
  offersTotal: number;
  isNewRegistryDrawerVisible: boolean;
  isDatamartSelectionsDrawerVisible: boolean;
  currentRegistry?: DeviceIdRegistryWithDatamartSelectionsResource;
  isDatamartsSelectionModalVisible: boolean;
  isEditRegistryDrawerVisible: boolean;
}

class DeviceIdRegistriesList extends React.Component<Props, DeviceIdRegistriesListState> {
  @lazyInject(TYPES.IDeviceIdRegistryService)
  private _deviceIdRegistryService: IDeviceIdRegistryService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoadingRegistries: false,
      isLoadingRegistryOffers: false,
      firstPartyDeviceIdRegistries: [],
      deviceIdRegistryOffers: [],
      registriesTotal: 0,
      offersTotal: 0,
      isNewRegistryDrawerVisible: false,
      isDatamartSelectionsDrawerVisible: false,
      isEditRegistryDrawerVisible: false,
      currentRegistry: undefined,
      isDatamartsSelectionModalVisible: false,
    };
  }

  fetchFirstPartyRegistries = (communityId: string) => {
    const { notifyError } = this.props;

    this.setState({
      isLoadingRegistries: true,
    });

    return Promise.all([
      this._deviceIdRegistryService.getDeviceIdRegistries(communityId, {
        type: 'CUSTOM_DEVICE_ID' as DeviceIdRegistryType,
        ...getPaginatedApiParam(1, 500),
      }),
      this._deviceIdRegistryService.getDeviceIdRegistries(communityId, {
        type: 'MOBILE_VENDOR_ID' as DeviceIdRegistryType,
        ...getPaginatedApiParam(1, 500),
      }),
      this._deviceIdRegistryService.getDeviceIdRegistries(communityId, {
        type: 'INSTALLATION_ID' as DeviceIdRegistryType,
        ...getPaginatedApiParam(1, 500),
      }),
    ])
      .then((results: DataListResponse<DeviceIdRegistryResource>[]) => {
        return results.reduce((acc: DeviceIdRegistryResource[], val) => {
          return acc.concat(val.data);
        }, []);
      })
      .then(registries => {
        Promise.all(
          registries.map(registry =>
            this._deviceIdRegistryService
              .getDeviceIdRegistryDatamartSelections(registry.id)
              .then(selections => {
                return {
                  datamart_selections: selections.data,
                  ...registry,
                } as DeviceIdRegistryWithDatamartSelectionsResource;
              }),
          ),
        )
          .then(registries => {
            this.setState({
              isLoadingRegistries: false,
              firstPartyDeviceIdRegistries: registries,
              registriesTotal: registries.length,
            });
          })
          .catch(err => {
            this.setState({
              isLoadingRegistries: false,
              firstPartyDeviceIdRegistries: [],
              registriesTotal: 0,
            });
            notifyError(err);
          });
      })

      .catch(err => {
        this.setState({
          isLoadingRegistries: false,
          firstPartyDeviceIdRegistries: [],
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
      firstPartyDeviceIdRegistries: [],
      deviceIdRegistryOffers: [],
      registriesTotal: 0,
      offersTotal: 0,
      isNewRegistryDrawerVisible: false,
      isDatamartSelectionsDrawerVisible: false,
      currentRegistry: undefined,
    });
  };

  componentDidMount() {
    const {
      workspace: { community_id, organisation_id },
    } = this.props;

    if (organisation_id === community_id) {
      this.fetchFirstPartyRegistries(organisation_id);
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
        this.fetchFirstPartyRegistries(organisation_id);
        this.fetchRegistryOffers(organisation_id);
      } else this.makeEmptyState();
    }
  }

  newRegistryOnClick = () => {
    this.setState({
      isNewRegistryDrawerVisible: true,
    });
  };

  newRegistryDrawerOnClose = () => {
    this.setState({
      isNewRegistryDrawerVisible: false,
    });
  };

  createRegistry = (registry: Partial<DeviceIdRegistryResource>) => {
    const {
      notifyError,
      notifySuccess,
      intl: { formatMessage },
    } = this.props;

    return this._deviceIdRegistryService
      .createDeviceIdRegistry(registry)
      .then(res => {
        this.setState(
          {
            isNewRegistryDrawerVisible: false,
          },
          () => {
            this.refreshFirstPartyRegistries();
            notifySuccess({
              message: formatMessage(messages.newRegistryCreationSuccess),
              description: '',
            });
          },
        );
        return res.data;
      })
      .then(createdRegistry => {
        this.setState({
          isDatamartsSelectionModalVisible: true,
          currentRegistry: {
            datamart_selections: [],
            ...createdRegistry,
          },
        });
        Modal.confirm({
          title: formatMessage(messages.datamartsSelectionModalTitle),
          content: formatMessage(messages.datamartsSelectionModalMessage),
          icon: <ExclamationCircleOutlined />,
          okText: 'OK',
          cancelText: formatMessage(messages.modalCancel),
          onOk: () => {
            this.datamartsSelectionModalOnOk();
          },
          onCancel: () => {
            this.datamartsSelectionDrawerOnClose();
          },
        });
      })
      .catch(err => {
        notifyError(err);
        this.setState({
          currentRegistry: undefined,
        });
      });
  };

  editRegistryAction = (registry: DeviceIdRegistryWithDatamartSelectionsResource): void => {
    this.setState({
      currentRegistry: registry,
      isEditRegistryDrawerVisible: true,
    });
  };

  editRegistryDrawerOnClose = (isVisible: boolean) => () => {
    this.setState({
      isEditRegistryDrawerVisible: isVisible,
    });
  };

  updateRegistry = (id: string) => {
    const {
      workspace: { community_id },
    } = this.props;

    return (updatedData: Partial<DeviceIdRegistryResource>) => {
      const {
        notifyError,
        notifySuccess,
        intl: { formatMessage },
      } = this.props;

      return this._deviceIdRegistryService
        .updateDeviceIdRegistry(id, community_id, updatedData)
        .then(() => {
          this.setState(
            {
              isEditRegistryDrawerVisible: false,
              currentRegistry: undefined,
            },
            () => {
              this.refreshFirstPartyRegistries();
              notifySuccess({
                message: formatMessage(messages.registryEditionSuccess),
                description: '',
              });
            },
          );
        })
        .catch(err => {
          this.setState({
            currentRegistry: undefined,
          });
          notifyError(err);
        });
    };
  };

  deleteRegistryOnOk = (registry: DeviceIdRegistryWithDatamartSelectionsResource) => {
    const {
      workspace: { community_id },
      notifyError,
      notifySuccess,
      intl: { formatMessage },
    } = this.props;

    return this._deviceIdRegistryService
      .deleteDeviceIdRegistry(registry.id, community_id)
      .then(() => {
        this.refreshFirstPartyRegistries();
        notifySuccess({
          message: formatMessage(messages.registryDeletionSuccess),
          description: '',
        });
      })
      .catch(err => {
        notifyError(err);
      });
  };

  deleteRegistryAction = (registry: DeviceIdRegistryWithDatamartSelectionsResource) => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (registry.datamart_selections.length !== 0) {
      return Modal.error({
        className: 'mcs-modal--errorDialog',
        icon: <ExclamationCircleOutlined />,
        title: formatMessage(messages.datamartSelectionsExistTitle),
        content: formatMessage(messages.datamartSelectionsExistMessage),
        okText: 'OK',
        onOk() {
          // closing modal
        },
      });
    } else {
      return Modal.confirm({
        title: formatMessage(messages.registryDeletionConfirmationTitle),
        content: formatMessage(messages.registryDeletionConfirmationMessage, {
          registryName: `${registry.name}`,
        }),
        icon: <ExclamationCircleOutlined />,
        okText: 'Yes',
        cancelText: formatMessage(messages.modalCancel),
        onOk: () => {
          this.deleteRegistryOnOk(registry);
        },
      });
    }
  };

  editDatamartsSelectionAction = (registry: DeviceIdRegistryWithDatamartSelectionsResource) => {
    this.setState({
      currentRegistry: registry,
      isDatamartSelectionsDrawerVisible: true,
    });
  };

  datamartsSelectionDrawerOnClose = () => {
    this.setState({
      currentRegistry: undefined,
      isDatamartSelectionsDrawerVisible: false,
    });
  };

  handleDatamartSelectionsUpdate = (deviceIdRegistryId: string, selectedDatamartIds: string[]) => {
    const {
      notifyError,
      notifySuccess,
      intl: { formatMessage },
    } = this.props;

    const previousSelections = this.state.currentRegistry!.datamart_selections;

    const updateSelectionsP = (): Promise<any> => {
      if (selectedDatamartIds.length === 0 && previousSelections.length !== 0) {
        const deleteTasks: Task[] = [];
        previousSelections.forEach(selection => {
          deleteTasks.push(() =>
            this._deviceIdRegistryService.deleteDeviceIdRegistryDatamartSelection(
              selection.id,
              selection.datamart_id,
            ),
          );
        });
        return executeTasksInSequence(deleteTasks);
      } else if (selectedDatamartIds.length === 0 && previousSelections.length === 0) {
        return Promise.resolve();
      } else {
        return this._deviceIdRegistryService.updateDeviceIdRegistryDatamartSelections(
          deviceIdRegistryId,
          selectedDatamartIds,
        );
      }
    };

    updateSelectionsP()
      .then(() => {
        this.setState(
          {
            currentRegistry: undefined,
            isDatamartSelectionsDrawerVisible: false,
          },
          () => {
            this.refreshFirstPartyRegistries();
            notifySuccess({
              message: formatMessage(messages.datamartSelectionsEditionSuccess),
              description: '',
            });
          },
        );
      })
      .catch(err => {
        notifyError(err);
        this.setState({
          currentRegistry: undefined,
        });
      });
  };

  refreshFirstPartyRegistries = () => {
    const {
      workspace: { community_id, organisation_id },
    } = this.props;

    if (organisation_id === community_id) {
      this.fetchFirstPartyRegistries(organisation_id);
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

  closeDatamartsSelectionModal = () => {
    this.setState({ isDatamartsSelectionModalVisible: false });
  };

  datamartsSelectionModalOnOk = () => {
    this.setState({
      isDatamartsSelectionModalVisible: false,
      isDatamartSelectionsDrawerVisible: true,
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const {
      isNewRegistryDrawerVisible,
      isDatamartSelectionsDrawerVisible,
      isEditRegistryDrawerVisible,
    } = this.state;

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
          render: (text: string, record: DeviceIdRegistryWithDatamartSelectionsResource) => {
            return (
              <span>
                {text}{' '}
                {record.datamart_selections.length === 0 && (
                  <span className='field-type'>
                    <Tooltip
                      placement='bottom'
                      title={formatMessage(messages.noDatamartsSelectionWarningTooltipText)}
                    >
                      <WarningOutlined style={{ color: 'orange' }} />
                    </Tooltip>
                  </span>
                )}
              </span>
            );
          },
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
          onClick={this.newRegistryOnClick}
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

    const firstPartyRegistryActions: Array<ActionsColumnDefinition<DeviceIdRegistryResource>> = [
      {
        key: 'action',
        actions: (record: DeviceIdRegistryResource) => [
          {
            message: formatMessage(messages.editDeviceIdRegistry),
            callback: this.editRegistryAction,
            disabled: record.type == 'INSTALLATION_ID',
          },
          {
            message: formatMessage(messages.editRegistryDatamartsSelection),
            callback: this.editDatamartsSelectionAction,
            disabled: record.type == 'INSTALLATION_ID',
          },
          {
            message: formatMessage(messages.deleteDeviceIdRegistry),
            callback: this.deleteRegistryAction,
            disabled: record.type == 'INSTALLATION_ID',
          },
        ],
      },
    ];

    return (
      <div className='ant-layout mcs-modal_container'>
        <Content className='mcs-content-container'>
          <Drawer
            className='mcs-deviceRegistriesEdit_drawer'
            width='800'
            bodyStyle={{ padding: '0' }}
            title={formatMessage(messages.newFirstPartyRegistryDrawerTitle)}
            placement={'right'}
            closable={true}
            onClose={this.newRegistryDrawerOnClose}
            visible={isNewRegistryDrawerVisible}
            destroyOnClose={true}
          >
            <DeviceIdRegistriesEditForm save={this.createRegistry} />
          </Drawer>

          <Drawer
            className='mcs-deviceRegistriesEdit_drawer'
            width='800'
            bodyStyle={{ padding: '0' }}
            title={
              this.state.currentRegistry &&
              formatMessage(messages.firstPartyDatamartSelectionsDrawerTitle, {
                registryName: `${this.state.currentRegistry.name}`,
              })
            }
            placement={'right'}
            closable={true}
            onClose={this.datamartsSelectionDrawerOnClose}
            visible={isDatamartSelectionsDrawerVisible}
            destroyOnClose={true}
          >
            {this.state.currentRegistry && (
              <DeviceIdRegistryDatamartSelectionsEditForm
                initialSelections={this.state.currentRegistry!.datamart_selections}
                deviceIdRegistry={this.state.currentRegistry!}
                handleSave={this.handleDatamartSelectionsUpdate}
              />
            )}
          </Drawer>

          <Drawer
            className='mcs-deviceRegistriesEdit_drawer'
            width='800'
            bodyStyle={{ padding: '0' }}
            title={formatMessage(messages.editFirstPartyRegistryDrawerTitle)}
            placement={'right'}
            closable={true}
            onClose={this.editRegistryDrawerOnClose(false)}
            visible={isEditRegistryDrawerVisible}
            destroyOnClose={true}
          >
            {this.state.currentRegistry && (
              <DeviceIdRegistriesEditForm
                initialValues={this.state.currentRegistry}
                deviceIdRegistry={this.state.currentRegistry!}
                save={this.updateRegistry(this.state.currentRegistry!.id)}
              />
            )}
          </Drawer>

          <Row className='mcs-table-container'>
            {simpleTableHeader(
              messages.firstPartyDeviceIdRegistries,
              this.hasRightToCreateRegistry() ? newRegistryButton : undefined,
            )}
            <TableViewFilters
              pagination={false}
              columns={deviceIdRegistryColumnsDefinition}
              dataSource={this.state.firstPartyDeviceIdRegistries}
              className='mcs-deviceIdRegistriesList_deviceIdRegistrytable'
              loading={this.state.isLoadingRegistries}
              actionsColumnsDefinition={firstPartyRegistryActions}
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
