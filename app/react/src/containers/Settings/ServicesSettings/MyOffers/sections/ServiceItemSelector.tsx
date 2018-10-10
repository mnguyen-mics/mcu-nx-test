import * as React from 'react';
import CatalogService, { GetServiceItemsOptions } from '../../../../../services/CatalogService';
import { ServiceItemShape } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { DataColumnDefinition } from '../../../../../components/TableView/TableView';
import TableSelector, { TableSelectorProps } from '../../../../../components/ElementSelector/TableSelector';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import messages from './messages';
import { compose } from 'recompose';
import { SearchFilter } from '../../../../../components/ElementSelector';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import ServiceOfferPageService from '../../ServiceOfferPageService';

const ServiceItemTableSelector: React.ComponentClass<TableSelectorProps<ServiceItemShape>> = TableSelector;

export interface ServiceItemSelectorProps {
  selectedServiceItemIds: string[];
  save: (serviceItems: ServiceItemShape[]) => void;
  close: () => void;
}

type Props = ServiceItemSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class ServiceItemSelector extends React.Component<Props> {
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

    return CatalogService.getServiceItems(organisationId, options);
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
        intlMessage: messages.serviceItemSelectorColumnName,
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        intlMessage: messages.serviceItemSelectorColumnType,
        key: 'type',
        render: (text, record) => <span>{ServiceOfferPageService.transformServiceType(record.type, formatMessage)}</span>,
      },
    ];

    const fetchServiceItem = (serviceItemId: string) => CatalogService.findServiceItem(serviceItemId);

    return (
      <ServiceItemTableSelector
        actionBarTitle={formatMessage(messages.serviceItemSelectorTitle)}
        displayFiltering={true}
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