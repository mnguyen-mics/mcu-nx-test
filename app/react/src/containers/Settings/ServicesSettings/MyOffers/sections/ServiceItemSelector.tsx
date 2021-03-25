import * as React from 'react';
import { GetServiceItemsOptions, ICatalogService } from '../../../../../services/CatalogService';
import { ServiceItemShape } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import TableSelector, { TableSelectorProps } from '../../../../../components/ElementSelector/TableSelector';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import messages from './messages';
import { compose } from 'recompose';
import { SearchFilter } from '../../../../../components/ElementSelector';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { IServiceOfferPageService } from '../../ServiceOfferPageService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const ServiceItemTableSelector: React.ComponentClass<TableSelectorProps<ServiceItemShape>> = TableSelector;

export interface ServiceItemSelectorProps {
  selectedServiceItemIds: string[];
  save: (serviceItems: ServiceItemShape[]) => void;
  close: () => void;
}

type Props = ServiceItemSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  searchFilter : SearchFilter;
}

class ServiceItemSelector extends React.Component<Props, State> {

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  @lazyInject(TYPES.IServiceOfferPageService)
  private _serviceOfferPageService: IServiceOfferPageService;

  saveServiceItems = (serviceItemIds: string[], serviceItems: ServiceItemShape[]) => {
    this.props.save(serviceItems);
  }

  fetchServiceItems = (filter: SearchFilter) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;

    const options: GetServiceItemsOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords
    }

    if (filter.type && filter.type.length !== 0) {
      options.type = filter.type;
    };

    return this._catalogService.getServiceItems(organisationId, options);
  }

  render() {
    const {
      selectedServiceItemIds,
      close,
      intl: {
        formatMessage,
      },
    } = this.props;

    const columns: Array<DataColumnDefinition<ServiceItemShape>> = [
      {
        title: formatMessage(messages.serviceItemSelectorColumnName),
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        title: formatMessage(messages.serviceItemSelectorColumnType),
        key: 'type',
        render: (text, record) => <span>{this._serviceOfferPageService.transformServiceType(record.type, formatMessage)}</span>,
      },
    ];

    const fetchServiceItem = (serviceItemId: string) => this._catalogService.findServiceItem(serviceItemId);

    return (
      <ServiceItemTableSelector
        actionBarTitle={formatMessage(messages.serviceItemSelectorTitle)}
        displayFiltering={true}
        displayTypeFilter={true}
        searchPlaceholder={formatMessage(
          messages.serviceItemSelectorSearchPlaceholder,
        )}
        selectedIds={selectedServiceItemIds}
        fetchDataList={this.fetchServiceItems}
        fetchData={fetchServiceItem}
        columnsDefinitions={columns}
        save={this.saveServiceItems}
        close={close}
      />
    );
  }
}

export default compose<Props, ServiceItemSelectorProps>(
  withRouter,
  injectIntl,
)(ServiceItemSelector);