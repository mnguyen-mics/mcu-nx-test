import * as React from 'react';

import messages from './messages';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { TableViewFilters } from '../../../../components/TableView/index';
import CatalogService from '../../../../services/CatalogService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import {
  ServiceItemConditionShape,
  isLinearServiceItemConditionsResource,
  LinearServiceItemConditionResource,
  isProvidedServiceItemConditionResource,
  CombinedServiceItemData,
} from '../../../../models/servicemanagement/PublicServiceItemResource';
import { compose } from 'recompose';
import OrgLogo from '../../../Logo/OrgLogo';
import { DataColumnDefinition } from '../../../../components/TableView/TableView';
import { uniq, map } from 'lodash';

interface State {
  loading: boolean;
  dataSource: CombinedServiceItemData[];
}

interface OfferCatalogTableProps {
  organisationId: string;
}

type Props = InjectedIntlProps &
  OfferCatalogTableProps &
  InjectedNotificationProps;

const processPrice = (data: ServiceItemConditionShape) => {
  if (isProvidedServiceItemConditionResource(data)) {
    return messages.freeLabel.defaultMessage;
  } else if (isLinearServiceItemConditionsResource(data) === true) {
    const linear = data as LinearServiceItemConditionResource;
    if (linear.percent_value === 0) {
      return `${Math.floor(linear.fixed_value * 1000).toString()} ${messages.cpmLabel.defaultMessage}`;
    }
    return messages.quoteLabel.defaultMessage;
  } else {
    return messages.quoteLabel.defaultMessage;
  }
};

const dataColumns: Array<DataColumnDefinition<CombinedServiceItemData>> = [
  {
    intlMessage: messages.providerLabel,
    key: 'serviceProvider.id',
    isVisibleByDefault: true,
    isHideable: false,
    render: (text: string) => (
      <span className={'mcs-offerCatalogTable_providerLogo'}>
        <OrgLogo organisationId={text} />
      </span>
    ),
  },
  {
    intlMessage: messages.nameLabel,
    key: 'serviceItem.name',
    isVisibleByDefault: true,
    isHideable: false,
    render: (text: string) => text,
  },
  {
    intlMessage: messages.priceLabel,
    key: 'serviceCondition',
    isVisibleByDefault: true,
    isHideable: false,
    render: (text: string, record: CombinedServiceItemData) =>
      processPrice(record.serviceCondition),
  },
];

class OfferCatalogTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      dataSource: [],
    };
  }

  componentDidMount() {
    const organisationId = this.props.organisationId;

    this.setState({
      loading: true,
    });

    CatalogService.findAvailableCombinedServiceItemsAndConditions(
      organisationId,
    ).then(serviceItemIdList => {
      const idFieldNames = [
        'provider_id',
        'service_offer_id',
        'service_item_conditions_id',
        'service_item_id',
      ];
      const fieldsMultiIds = idFieldNames.map(field =>
        uniq(map(serviceItemIdList.data, field)),
      );

      Promise.all([
        CatalogService.findAvailableServiceProvidersMultiId(
          organisationId,
          fieldsMultiIds[0],
        ),
        CatalogService.findAvailableServiceOffersMultiId(
          organisationId,
          fieldsMultiIds[1],
        ),
        CatalogService.findAvailableServiceConditionsMultiId(
          organisationId,
          fieldsMultiIds[2],
        ),
        CatalogService.findAvailableServiceItemsMultiId(
          organisationId,
          fieldsMultiIds[3],
        ),
      ])
        .then(item => {
          const metaDataSource: CombinedServiceItemData[] = serviceItemIdList.data.map(
            ids => {
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
            },
          );
          this.setState({
            loading: false,
            dataSource: metaDataSource,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    });
  }
  render() {
    const { dataSource, loading } = this.state;
    return (
      <div className="mcs-table-container mcs-offerCatalogTable">
        <TableViewFilters
          columns={dataColumns}
          dataSource={dataSource}
          loading={loading}
        />
      </div>
    );
  }
}

export default compose<Props, OfferCatalogTableProps>(
  injectIntl,
  injectNotifications,
)(OfferCatalogTable);
