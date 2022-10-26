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
import { EmptyTableView, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import {
  DeviceIdRegistryDatamartSelectionResource,
  DeviceIdRegistryOfferResource,
  DeviceIdRegistryResource,
  DeviceIdRegistryType,
} from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart';
import DeviceIdRegistriesEditForm from '../Edit/DeviceIdRegistriesEditForm';
import DeviceIdRegistryDatamartSelectionsEditForm from '../Edit/DeviceIdRegistryDatamartSelectionsEditForm';
import DeviceIdRegistrySubscriptionsEditForm from '../Edit/DeviceIdRegistrySubscriptionsEditForm';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons/lib/icons';
import { executeTasksInSequence, Task } from '../../../../../utils/PromiseHelper';
import { ICatalogService } from '../../../../../services/CatalogService';
import { AgreementType } from '../../../../../models/servicemanagement/PublicServiceItemResource';

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

type RowType = 'OFFER_HEADER' | 'REGISTRY';

class ThirdPartyOfferHeaderRow {
  _row_type: RowType = 'OFFER_HEADER';

  id: string;
  name: string;
}

class ThirdPartyRegistryRow implements DeviceIdRegistryWithDatamartSelectionsResource {
  _row_type: RowType = 'REGISTRY';

  datamart_selections: DeviceIdRegistryDatamartSelectionResource[];
  id: string;
  name: string;
  description?: string | undefined;
  type: DeviceIdRegistryType;
  organisation_id: string;
}

type ThirdPartyDataRow = ThirdPartyOfferHeaderRow | ThirdPartyRegistryRow;

interface DeviceIdRegistriesListState {
  isLoadingFirstPartyRegistries: boolean;
  isLoadingThirdPartyRegistries: boolean;
  firstPartyRegistries: DeviceIdRegistryWithDatamartSelectionsResource[];
  thirdPartyRegistries: ThirdPartyDataRow[];
  subscribedRegistryOffers: DeviceIdRegistryOfferResource[];
  availableRegistryOffers: DeviceIdRegistryOfferResource[];
  firstPartyRegistriesTotal: number;
  thirdPartyRegistriesTotal: number;
  subscribedRegistryOffersTotal: number;
  availableRegistryOffersTotal: number;
  isNewRegistryDrawerVisible: boolean;
  isDatamartSelectionsDrawerVisible: boolean;
  currentRegistry?: DeviceIdRegistryWithDatamartSelectionsResource;
  isDatamartsSelectionModalVisible: boolean;
  isEditRegistryDrawerVisible: boolean;
  isSubscriptionsDrawerVisible: boolean;
}

// Workaround till we pass to newer version of Node
interface MyHTMLAttributes<T> extends React.HTMLAttributes<T> {
  colSpan?: number | undefined;
}
declare type MyGetComponentProps<DataType> = (
  data: DataType,
  index?: number,
) => MyHTMLAttributes<any>;

class DeviceIdRegistriesList extends React.Component<Props, DeviceIdRegistriesListState> {
  @lazyInject(TYPES.IDeviceIdRegistryService)
  private _deviceIdRegistryService: IDeviceIdRegistryService;

  @lazyInject(TYPES.ICatalogService)
  private _catalogueService: ICatalogService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoadingFirstPartyRegistries: false,
      isLoadingThirdPartyRegistries: false,
      firstPartyRegistries: [],
      thirdPartyRegistries: [],
      subscribedRegistryOffers: [],
      availableRegistryOffers: [],
      firstPartyRegistriesTotal: 0,
      thirdPartyRegistriesTotal: 0,
      subscribedRegistryOffersTotal: 0,
      availableRegistryOffersTotal: 0,
      isNewRegistryDrawerVisible: false,
      isDatamartSelectionsDrawerVisible: false,
      isEditRegistryDrawerVisible: false,
      currentRegistry: undefined,
      isDatamartsSelectionModalVisible: false,
      isSubscriptionsDrawerVisible: false,
    };
  }

  fetchFirstPartyRegistries = (organisationId: string) => {
    const { notifyError } = this.props;

    this.setState({
      isLoadingFirstPartyRegistries: true,
    });

    return Promise.all([
      this._deviceIdRegistryService.getDeviceIdRegistries(organisationId, {
        type: DeviceIdRegistryType.CUSTOM_DEVICE_ID,
        ...getPaginatedApiParam(1, 500),
      }),
      this._deviceIdRegistryService.getDeviceIdRegistries(organisationId, {
        type: DeviceIdRegistryType.MOBILE_VENDOR_ID,
        ...getPaginatedApiParam(1, 500),
      }),
      this._deviceIdRegistryService.getDeviceIdRegistries(organisationId, {
        type: DeviceIdRegistryType.INSTALLATION_ID,
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
              isLoadingFirstPartyRegistries: false,
              firstPartyRegistries: registries,
              firstPartyRegistriesTotal: registries.length,
            });
          })
          .catch(err => {
            this.setState({
              isLoadingFirstPartyRegistries: false,
              firstPartyRegistries: [],
              firstPartyRegistriesTotal: 0,
            });
            notifyError(err);
          });
      })
      .catch(err => {
        this.setState({
          isLoadingFirstPartyRegistries: false,
          firstPartyRegistries: [],
          firstPartyRegistriesTotal: 0,
        });
        notifyError(err);
      });
  };

  fetchAvailableRegistryOffers = (organisationId: string) => {
    const { notifyError } = this.props;

    const offersOptions = {
      ...getPaginatedApiParam(1, 500),
    };

    const availableOffers = this._deviceIdRegistryService.getDeviceIdRegistryOffers(offersOptions);

    return availableOffers
      .then(res => {
        this.setState({
          availableRegistryOffers: res.data,
          availableRegistryOffersTotal: res.data.length,
        });
      })
      .catch(err => {
        this.setState({
          availableRegistryOffers: [],
          availableRegistryOffersTotal: 0,
        });
        notifyError(err);
      });
  };

  fetchSubscribedThirdPartyRegistries = (organisationId: string) => {
    const { notifyError } = this.props;

    this.setState({ isLoadingThirdPartyRegistries: true }, () => {
      const offersOptions = {
        subscriber_id: organisationId,
        signed_agreement: true,
        ...getPaginatedApiParam(1, 500),
      };

      const subscribedOffers =
        this._deviceIdRegistryService.getDeviceIdRegistryOffers(offersOptions);

      return subscribedOffers
        .then(res => {
          const thirdPartyDataRows: ThirdPartyDataRow[] = res.data.flatMap(offer => {
            return [
              {
                _row_type: 'OFFER_HEADER',
                id: offer.id,
                name: offer.name,
              } as ThirdPartyOfferHeaderRow,
            ].concat(
              offer.device_id_registries.map(
                registry =>
                  ({
                    _row_type: 'REGISTRY',
                    ...registry,
                  } as ThirdPartyRegistryRow),
              ),
            );
          });
          const nbOfRegistries = res.data.reduce(
            (acc: number, offer: DeviceIdRegistryOfferResource) => {
              return acc + offer.device_id_registries.length;
            },
            0,
          );
          this.setState({
            thirdPartyRegistriesTotal: nbOfRegistries,
            subscribedRegistryOffers: res.data,
            subscribedRegistryOffersTotal: res.data.length,
          });
          return thirdPartyDataRows;
        })
        .then(thirdPartyDataRows => {
          return Promise.all(
            thirdPartyDataRows.map(row => {
              if (this.thirdPartyRowIsRegistry(row)) {
                return this._deviceIdRegistryService
                  .getDeviceIdRegistryDatamartSelections((row as ThirdPartyRegistryRow).id)
                  .then(selections => {
                    return {
                      ...row,
                      datamart_selections: selections.data,
                    } as ThirdPartyRegistryRow;
                  });
              } else {
                return row;
              }
            }),
          );
        })
        .then(thirdPartyDataRowsWithSelections => {
          this.setState({
            isLoadingThirdPartyRegistries: false,
            thirdPartyRegistries: thirdPartyDataRowsWithSelections,
          });
        })
        .catch(err => {
          this.setState({
            isLoadingThirdPartyRegistries: false,
            thirdPartyRegistries: [],
            thirdPartyRegistriesTotal: 0,
            subscribedRegistryOffers: [],
            subscribedRegistryOffersTotal: 0,
          });
          notifyError(err);
        });
    });
  };

  makeEmptyState = () => {
    this.setState({
      isLoadingFirstPartyRegistries: false,
      isLoadingThirdPartyRegistries: false,
      firstPartyRegistries: [],
      thirdPartyRegistries: [],
      firstPartyRegistriesTotal: 0,
      thirdPartyRegistriesTotal: 0,
      isNewRegistryDrawerVisible: false,
      isDatamartSelectionsDrawerVisible: false,
      currentRegistry: undefined,
      isSubscriptionsDrawerVisible: false,
    });
  };

  componentDidMount() {
    const {
      workspace: { organisation_id },
    } = this.props;

    this.fetchFirstPartyRegistries(organisation_id);
    this.fetchSubscribedThirdPartyRegistries(organisation_id);
    this.fetchAvailableRegistryOffers(organisation_id);
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
      workspace: { organisation_id },
    } = this.props;

    if (previousOrganisationId !== organisationId) {
      this.fetchFirstPartyRegistries(organisation_id);
      this.fetchSubscribedThirdPartyRegistries(organisation_id);
      this.fetchAvailableRegistryOffers(organisation_id);
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
      workspace: { organisation_id },
    } = this.props;

    return (updatedData: Partial<DeviceIdRegistryResource>) => {
      const {
        notifyError,
        notifySuccess,
        intl: { formatMessage },
      } = this.props;

      return this._deviceIdRegistryService
        .updateDeviceIdRegistry(id, organisation_id, updatedData)
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
      workspace: { organisation_id },
      notifyError,
      notifySuccess,
      intl: { formatMessage },
    } = this.props;

    return this._deviceIdRegistryService
      .deleteDeviceIdRegistry(registry.id, organisation_id)
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
        content: (
          <FormattedMessage
            id={messages.registryDeletionConfirmationMessage.id}
            defaultMessage={messages.registryDeletionConfirmationMessage.defaultMessage}
            values={{
              registryName: <b>{`${registry.name}`}</b>,
            }}
          />
        ),
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

  editThirdPartyDatamartsSelectionAction = (registry: ThirdPartyRegistryRow) => {
    this.editDatamartsSelectionAction(registry);
  };

  unsubsribeFromOfferAction = (offer: ThirdPartyOfferHeaderRow) => {
    this.unsubscribeFromOffer(offer.id);
  };

  datamartsSelectionDrawerOnClose = () => {
    this.setState({
      currentRegistry: undefined,
      isDatamartSelectionsDrawerVisible: false,
    });
  };

  handleDatamartSelectionsUpdate = (
    deviceIdRegistryId: string,
    selectedDatamartIds: string[],
    refresh: () => void,
  ) => {
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
            refresh();
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

  manageSubscriptionsOnClick = () => {
    this.setState({
      isSubscriptionsDrawerVisible: true,
    });
  };

  manageSubscriptionsOnClose = (isVisible: boolean) => () => {
    this.setState({
      isSubscriptionsDrawerVisible: isVisible,
    });
  };

  subscribeToOffer = (id: string) => {
    const {
      workspace: { organisation_id },
      intl: { formatMessage },
      notifySuccess,
      notifyError,
    } = this.props;

    if (this.hasRightToSubscribeToOffer()) {
      return this._catalogueService
        .createServiceAgreement(organisation_id, AgreementType.REGULAR)
        .then(agreementRes => {
          return this._catalogueService
            .addOfferToAgreement(organisation_id, agreementRes.data.id, id)
            .then(() => agreementRes.data.id);
        })
        .then(agreement_id => {
          this._catalogueService.updateServiceAgreement(organisation_id, agreement_id, {
            signed: true,
          });
        })
        .then(() => {
          this.setState(
            {
              isSubscriptionsDrawerVisible: false,
            },
            () => {
              this.refreshThirdPartyRegistries();
              notifySuccess({
                message: formatMessage(messages.offerSubscriptionSuccess),
                description: '',
              });
            },
          );
        })
        .catch(err => {
          notifyError(err);
        });
    } else {
      return Modal.error({
        className: 'mcs-modal--errorDialog',
        icon: <ExclamationCircleOutlined />,
        title: formatMessage(messages.subscriptionNotAllowedTitle),
        content: formatMessage(messages.subscriptionNotAllowedMessage),
        okText: 'OK',
        onOk() {
          // closing modal
        },
      });
    }
  };

  unsubscribeFromOffer = (id: string) => {
    const {
      workspace: { organisation_id },
      intl: { formatMessage },
      notifySuccess,
      notifyError,
    } = this.props;
    const offer = this.state.subscribedRegistryOffers.find(offer => offer.id === id)!;
    const offerSelections = offer.device_id_registries.flatMap(registry => {
      const r = this.state.thirdPartyRegistries.find(
        thirdPartyRow => thirdPartyRow.id === registry.id && thirdPartyRow._row_type === 'REGISTRY',
      )!;
      return (r as ThirdPartyRegistryRow).datamart_selections;
    });

    if (this.hasRightToUnsubscribeFromOffer()) {
      if (offerSelections.length !== 0) {
        return Modal.error({
          className: 'mcs-modal--errorDialog',
          icon: <ExclamationCircleOutlined />,
          title: formatMessage(messages.thirdPartyDatamartSelectionsExistTitle),
          content: formatMessage(messages.thirdPartyDatamartSelectionsExistMessage),
          okText: 'OK',
          onOk() {
            // closing modal
          },
        });
      } else {
        return Modal.confirm({
          title: formatMessage(messages.offerUnsubscriptionConfirmationTitle),
          content: (
            <FormattedMessage
              id={messages.offerUnsubscriptionConfirmationMessage.id}
              defaultMessage={messages.offerUnsubscriptionConfirmationMessage.defaultMessage}
              values={{
                offerName: <b>{`${offer.name}`}</b>,
              }}
            />
          ),
          icon: <ExclamationCircleOutlined />,
          okText: 'Yes',
          cancelText: formatMessage(messages.modalCancel),
          onOk: () => {
            if (!!offer.agreement_id) {
              return this._catalogueService
                .removeOfferFromAgreement(organisation_id, offer.agreement_id!, id)
                .then(() => {
                  this._catalogueService.deleteServiceAgreement(
                    organisation_id,
                    offer.agreement_id!,
                  );
                })
                .then(() => {
                  this.setState(
                    {
                      isSubscriptionsDrawerVisible: false,
                    },
                    () => {
                      this.refreshThirdPartyRegistries();
                      notifySuccess({
                        message: formatMessage(messages.offerUnsubscriptionSuccess),
                        description: '',
                      });
                    },
                  );
                })
                .catch(err => {
                  notifyError(err);
                });
            } else {
              return Promise.reject(new Error("Can't unsubscribe from offer (missing agreement)"));
            }
          },
        });
      }
    } else {
      return Modal.error({
        className: 'mcs-modal--errorDialog',
        icon: <ExclamationCircleOutlined />,
        title: formatMessage(messages.unsubscriptionNotAllowedTitle),
        content: formatMessage(messages.unsubscriptionNotAllowedMessage),
        okText: 'OK',
        onOk() {
          // closing modal
        },
      });
    }
  };

  refreshFirstPartyRegistries = () => {
    const {
      workspace: { organisation_id },
    } = this.props;

    this.fetchFirstPartyRegistries(organisation_id);
  };

  refreshThirdPartyRegistries = () => {
    const {
      workspace: { organisation_id },
    } = this.props;

    this.fetchSubscribedThirdPartyRegistries(organisation_id);
    this.fetchAvailableRegistryOffers(organisation_id);
  };

  hasRightToCreateRegistry(): boolean {
    const {
      workspace: { role },
    } = this.props;

    return (
      role === 'ORGANISATION_ADMIN' ||
      role === 'COMMUNITY_ADMIN' ||
      role === 'CUSTOMER_ADMIN' ||
      role === 'SUPER_ADMIN'
    );
  }

  hasRightToSubscribeToOffer(): boolean {
    const {
      workspace: { role },
    } = this.props;

    return role === 'CUSTOMER_ADMIN' || role === 'SUPER_ADMIN';
  }

  hasRightToUnsubscribeFromOffer(): boolean {
    return this.hasRightToSubscribeToOffer();
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

  thirdPartyRowIsOffer = (row: ThirdPartyDataRow) => {
    return row._row_type === 'OFFER_HEADER';
  };

  thirdPartyRowIsRegistry = (row: ThirdPartyDataRow) => {
    return row._row_type === 'REGISTRY';
  };

  isInstanceOfThirdPartyDataRow(object: any): object is ThirdPartyDataRow {
    return '_row_type' in object;
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const {
      isNewRegistryDrawerVisible,
      isDatamartSelectionsDrawerVisible,
      isEditRegistryDrawerVisible,
      isSubscriptionsDrawerVisible,
      isLoadingFirstPartyRegistries,
      isLoadingThirdPartyRegistries,
      firstPartyRegistries,
      thirdPartyRegistries,
      subscribedRegistryOffers,
      availableRegistryOffers,
    } = this.state;

    const subscribableRegistryOffers = availableRegistryOffers.filter(
      offer => !subscribedRegistryOffers.find(o => o.id === offer.id),
    );

    const firstPartyRegistryColumns: Array<DataColumnDefinition<DeviceIdRegistryResource>> = [
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

    const myOnCell = (customSpan: number) =>
      ((record: ThirdPartyDataRow, _: number) => ({
        colSpan: this.thirdPartyRowIsOffer(record) ? customSpan : 1,
      })) as MyGetComponentProps<ThirdPartyDataRow>;

    const thirdPartyRegistriesColumns: Array<DataColumnDefinition<ThirdPartyDataRow>> = [
      {
        title: formatMessage(messages.deviceIdRegistryId),
        key: 'id',
        isHideable: false,
        onCell: myOnCell(0),
      },
      {
        title: formatMessage(messages.deviceIdRegistryName),
        key: 'name',
        isHideable: false,
        render: (text: string, record: ThirdPartyDataRow) => {
          return this.thirdPartyRowIsOffer(record) ? (
            <span>{record.name}</span>
          ) : (
            <span>{text}</span>
          );
        },
        onCell: myOnCell(3),
      },
      {
        title: formatMessage(messages.deviceIdRegistryType),
        key: 'type',
        isHideable: false,
        onCell: myOnCell(0),
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

    const manageSubscriptionsButton = (
      <span className='mcs-card-button'>
        <Button
          key='manage'
          type='primary'
          className='mcs-primary'
          onClick={this.manageSubscriptionsOnClick}
          disabled={!subscribedRegistryOffers.length && !subscribableRegistryOffers.length}
        >
          {formatMessage(messages.manageSubscriptions)}
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

    const firstPartyRegistryActions: Array<
      ActionsColumnDefinition<DeviceIdRegistryWithDatamartSelectionsResource>
    > = [
      {
        key: 'action',
        actions: (record: DeviceIdRegistryResource) => [
          {
            message: formatMessage(messages.editDeviceIdRegistry),
            callback: this.editRegistryAction,
            disabled: record.type == DeviceIdRegistryType.INSTALLATION_ID,
          },
          {
            message: formatMessage(messages.editRegistryDatamartsSelection),
            callback: this.editDatamartsSelectionAction,
            disabled: record.type == DeviceIdRegistryType.INSTALLATION_ID,
          },
          {
            message: formatMessage(messages.deleteDeviceIdRegistry),
            callback: this.deleteRegistryAction,
            disabled: record.type == DeviceIdRegistryType.INSTALLATION_ID,
          },
        ],
      },
    ];

    const thirdPartyRegistryActions: Array<ActionsColumnDefinition<ThirdPartyDataRow>> = [
      {
        key: 'action',
        actions: (record: ThirdPartyDataRow) => {
          return this.thirdPartyRowIsOffer(record)
            ? [
                {
                  message: formatMessage(messages.unsubscribe),
                  callback: this.unsubsribeFromOfferAction,
                },
              ]
            : [
                {
                  message: formatMessage(messages.editRegistryDatamartsSelection),
                  callback: this.editThirdPartyDatamartsSelectionAction,
                },
              ];
        },
      },
    ];

    const handleDatamartSelectionsSave = (
      deviceIdRegistryId: string,
      selectedDatamartIds: string[],
    ) => {
      this.handleDatamartSelectionsUpdate(
        deviceIdRegistryId,
        selectedDatamartIds,
        this.isInstanceOfThirdPartyDataRow(this.state.currentRegistry) &&
          this.thirdPartyRowIsRegistry(this.state.currentRegistry as ThirdPartyDataRow)
          ? this.refreshThirdPartyRegistries
          : this.refreshFirstPartyRegistries,
      );
    };

    return (
      <Layout className='ant-layout'>
        <Content className='mcs-content-container'>
          <Drawer
            className='mcs-deviceRegistriesList_drawer'
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
            className='mcs-deviceRegistriesList_drawer'
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
                handleSave={handleDatamartSelectionsSave}
              />
            )}
          </Drawer>

          <Drawer
            className='mcs-deviceRegistriesList_drawer'
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
            {!firstPartyRegistries.length && !isLoadingFirstPartyRegistries ? (
              <EmptyTableView
                className='mcs-table-view-empty mcs-empty-card'
                iconType={'settings'}
                message={formatMessage(messages.emptyDeviceIdRegistries)}
              />
            ) : (
              <TableViewFilters
                pagination={false}
                columns={firstPartyRegistryColumns}
                dataSource={firstPartyRegistries}
                className='mcs-deviceIdRegistriesList_firstPartyRegistriestable'
                loading={isLoadingFirstPartyRegistries}
                actionsColumnsDefinition={firstPartyRegistryActions}
              />
            )}
          </Row>
          <Row className='mcs-table-container'>
            {simpleTableHeader(messages.thirdPartyDeviceIdRegistries, manageSubscriptionsButton)}
            {!thirdPartyRegistries.length && !isLoadingThirdPartyRegistries ? (
              <EmptyTableView
                className='mcs-table-view-empty mcs-empty-card'
                iconType={'settings'}
                message={formatMessage(messages.emptyDeviceIdRegistries)}
              />
            ) : (
              <TableViewFilters
                pagination={false}
                columns={thirdPartyRegistriesColumns}
                dataSource={thirdPartyRegistries}
                className='mcs-deviceIdRegistriesList_thirdPartyRegistriestable'
                loading={isLoadingThirdPartyRegistries}
                rowClassName={(record, _) =>
                  this.thirdPartyRowIsOffer(record)
                    ? 'mcs-deviceIdRegistriesList_registryOfferHeader'
                    : ''
                }
                actionsColumnsDefinition={thirdPartyRegistryActions}
              />
            )}
          </Row>

          <Drawer
            className='mcs-deviceRegistriesList_drawer'
            width='800'
            bodyStyle={{ padding: '0' }}
            title={formatMessage(messages.thirdPartyRegistrySubscriptionsDrawerTitle)}
            placement={'right'}
            closable={true}
            onClose={this.manageSubscriptionsOnClose(false)}
            visible={isSubscriptionsDrawerVisible}
            destroyOnClose={true}
          >
            <DeviceIdRegistrySubscriptionsEditForm
              subscribedOffers={subscribedRegistryOffers}
              subscribableOffers={subscribableRegistryOffers}
              subscribe={this.subscribeToOffer}
              unsubscribe={this.unsubscribeFromOffer}
            />
          </Drawer>
        </Content>
      </Layout>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectNotifications,
  injectIntl,
  injectWorkspace,
)(DeviceIdRegistriesList);
