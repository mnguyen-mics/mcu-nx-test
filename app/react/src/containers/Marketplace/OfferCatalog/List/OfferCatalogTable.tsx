import * as React from 'react';

import messages from './messages';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import {
  ServiceItemConditionShape,
  isLinearServiceItemConditionsResource,
  LinearServiceItemConditionResource,
  isProvidedServiceItemConditionResource,
  CombinedServiceItemData,
  ServiceType,
  CombinedServiceItemsAndConditions,
  ServiceProviderResource,
  ServiceOfferLocaleResource,
  ServiceItemShape,
} from '../../../../models/servicemanagement/PublicServiceItemResource';
import { compose } from 'recompose';
import OrgLogoContainer from '../../../Logo/OrgLogoContainer';
import { uniq, map } from 'lodash';
import { CancelablePromise, makeCancelable } from '../../../../utils/ApiHelper';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { ICatalogService } from '../../../../services/CatalogService';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { LabelsSelectorMessages } from '@mediarithmics-private/mcs-components-library/lib/components/labels-selector';
import { convertMessageDescriptorToString, labelSelectorMessages } from '../../../../IntlMessages';

interface ServiceTypeLabel {
  id: string;
  name: string;
  type: ServiceType;
}

interface State {
  loading: boolean;
  labels: ServiceTypeLabel[];
  selectedLabels: ServiceTypeLabel[];
  dataSource: CombinedServiceItemData[];
}

interface OfferCatalogTableProps {
  organisationId: string;
}

type Props = WrappedComponentProps & OfferCatalogTableProps & InjectedNotificationProps;

const processPrice = (data: ServiceItemConditionShape) => {
  if (isProvidedServiceItemConditionResource(data)) {
    return messages.freeLabel.defaultMessage;
  } else {
    if (isLinearServiceItemConditionsResource(data)) {
      const linear = data as LinearServiceItemConditionResource;
      if (linear.percent_value === 0) {
        return `${Math.floor(linear.fixed_value * 1000).toString()} ${
          messages.cpmLabel.defaultMessage
        }`;
      }
    }
    return messages.quoteLabel.defaultMessage;
  }
};

const displayServiceItemType = (type: string) => {
  return type
    .split('_')
    .map(s => {
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
    })
    .join(' ');
};

// TODO: when backend is available, retrieve all types and create
// a proper array of labels typed like this: Label[]
const serviceTypeLabels: ServiceTypeLabel[] = [
  { id: '1', name: 'Audience Segment', type: 'AUDIENCE_DATA.AUDIENCE_SEGMENT' },
  { id: '2', name: 'User Data Type', type: 'AUDIENCE_DATA.USER_DATA_TYPE' },
  { id: '3', name: 'Adex Inventory', type: 'DISPLAY_CAMPAIGN.ADEX_INVENTORY' },
  {
    id: '4',
    name: 'Real Time Bidding',
    type: 'DISPLAY_CAMPAIGN.REAL_TIME_BIDDING',
  },
  { id: '5', name: 'Visibility', type: 'DISPLAY_CAMPAIGN.VISIBILITY' },
  {
    id: '6',
    name: 'Inventory Access',
    type: 'DISPLAY_CAMPAIGN.INVENTORY_ACCESS',
  },
  {
    id: '7',
    name: 'Ad Exchance Hub Inventory',
    type: 'DISPLAY_CAMPAIGN.AD_EXCHANGE_HUB_INVENTORY',
  },
  {
    id: '8',
    name: 'Display Network Inventory',
    type: 'DISPLAY_CAMPAIGN.DISPLAY_NETWORK_INVENTORY',
  },
];

class OfferCatalogTable extends React.Component<Props, State> {
  cancelableCombinedIdPromise: CancelablePromise<
    DataListResponse<CombinedServiceItemsAndConditions>
  >;
  cancelableServiceItemIds: CancelablePromise<
    [
      DataListResponse<ServiceProviderResource>,
      DataListResponse<ServiceOfferLocaleResource>,
      DataListResponse<ServiceItemConditionShape>,
      DataListResponse<ServiceItemShape>,
    ]
  >;

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      labels: serviceTypeLabels,
      selectedLabels: [],
      dataSource: [],
    };
  }

  fetchServiceItemData() {
    const organisationId = this.props.organisationId;
    const selectedLabels = this.state.selectedLabels;
    const serviceTypes =
      selectedLabels.length === 0
        ? undefined
        : { service_types: selectedLabels.map(label => label.type) };

    this.setState({ loading: true });
    this.cancelableCombinedIdPromise = makeCancelable(
      this._catalogService.findAvailableCombinedServiceItemsIds(organisationId, {
        ...serviceTypes,
      }),
    );

    this.cancelableCombinedIdPromise.promise
      .then(idList => {
        if (idList.data === undefined || idList.data.length === 0) {
          this.setState({
            loading: false,
            dataSource: [],
          });
        } else {
          const idFieldNames = [
            'provider_id',
            'service_offer_id',
            'service_item_conditions_id',
            'service_item_id',
          ];
          const fieldsMultiIds = idFieldNames.map(field => uniq(map(idList.data, field)));
          this.cancelableServiceItemIds = makeCancelable(
            Promise.all([
              this._catalogService.findAvailableServiceProvidersMultiId(
                organisationId,
                fieldsMultiIds[0],
              ),
              this._catalogService.findAvailableServiceOffersMultiId(
                organisationId,
                fieldsMultiIds[1],
              ),
              this._catalogService.findAvailableServiceConditionsMultiId(
                organisationId,
                fieldsMultiIds[2],
              ),
              this._catalogService.findAvailableServiceItemsMultiId(
                organisationId,
                fieldsMultiIds[3],
              ),
            ]),
          );
          this.cancelableServiceItemIds.promise
            .then(item => {
              const metaDataSource: CombinedServiceItemData[] = idList.data.map(ids => {
                const serviceProvider = item[0].data.find(
                  provider => provider.id === ids.provider_id.toString(),
                );
                const serviceOffer = item[1].data.find(
                  offer => offer.id === ids.service_offer_id.toString(),
                );
                const serviceCondition = item[2].data.find(
                  condition => condition.id === ids.service_item_conditions_id.toString(),
                );
                const serviceItem = item[3].data.find(
                  sItem => sItem.id === ids.service_item_id.toString(),
                );

                if (
                  serviceProvider === undefined ||
                  serviceOffer === undefined ||
                  serviceCondition === undefined ||
                  serviceItem === undefined
                ) {
                  throw new Error('Error while fetching data');
                }
                return {
                  serviceProvider,
                  serviceOffer,
                  serviceCondition,
                  serviceItem,
                };
              });
              this.setState({
                loading: false,
                dataSource: metaDataSource,
              });
            })
            .catch(err => {
              this.setState({ loading: false });
              this.props.notifyError(err);
            });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  componentDidMount() {
    this.fetchServiceItemData();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.selectedLabels !== prevState.selectedLabels) {
      this.fetchServiceItemData();
    }
  }

  componentWillUnmount() {
    if (this.cancelableCombinedIdPromise) this.cancelableCombinedIdPromise.cancel();
    if (this.cancelableServiceItemIds) this.cancelableServiceItemIds.cancel();
  }

  updateLabels = (labels: ServiceTypeLabel[]) => {
    this.setState({ selectedLabels: labels });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const { dataSource, loading, labels, selectedLabels } = this.state;

    const dataColumns: Array<DataColumnDefinition<CombinedServiceItemData>> = [
      {
        title: formatMessage(messages.providerLabel),
        key: 'serviceProvider.id',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text: string) => (
          <span className={'mcs-offerCatalogTable_providerLogo'}>
            <OrgLogoContainer organisationId={text} />
          </span>
        ),
      },
      {
        title: formatMessage(messages.typeLabel),
        key: 'serviceItem.type',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text: string) => displayServiceItemType(text),
      },
      {
        title: formatMessage(messages.nameLabel),
        key: 'serviceItem.name',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.priceLabel),
        key: 'serviceCondition',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text: string, record: CombinedServiceItemData) =>
          processPrice(record.serviceCondition),
      },
    ];

    // TO
    const labelsOptions: any = {
      labels: labels,
      selectedLabels: labels.filter(label => {
        return selectedLabels.find(l => l.id === label.id) ? true : false;
      }),
      onChange: (newLabels: ServiceTypeLabel[]) => {
        this.updateLabels(newLabels);
      },
      buttonMessage: messages.filterLabel,
      messages: convertMessageDescriptorToString(
        labelSelectorMessages,
        this.props.intl,
      ) as LabelsSelectorMessages,
    };

    return (
      <div className='mcs-table-container mcs-offerCatalogTable'>
        <TableViewFilters
          columns={dataColumns}
          dataSource={dataSource}
          loading={loading}
          labelsOptions={labelsOptions}
        />
      </div>
    );
  }
}

export default compose<Props, OfferCatalogTableProps>(
  injectIntl,
  injectNotifications,
)(OfferCatalogTable);
