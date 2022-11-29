import * as React from 'react';
import { GetServiceItemsOptions, ICatalogService } from '../../../../../services/CatalogService';
import { ServiceItemShape } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import messages from './messages';
import { compose } from 'recompose';
import { TableSelector } from '@mediarithmics-private/mcs-components-library';
import { TableSelectorProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-selector';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { IServiceOfferPageService } from '../../ServiceOfferPageService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { connect } from 'react-redux';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const ServiceItemTableSelector: React.ComponentClass<TableSelectorProps<ServiceItemShape>> =
  TableSelector;

export interface ServiceItemSelectorProps {
  selectedServiceItemIds: string[];
  save: (serviceItems: ServiceItemShape[]) => void;
  close: () => void;
}

type Props = ServiceItemSelectorProps &
  WrappedComponentProps &
  MapStateProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  searchFilter: SearchFilter;
}

interface MapStateProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

class ServiceItemSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  @lazyInject(TYPES.IServiceOfferPageService)
  private _serviceOfferPageService: IServiceOfferPageService;

  saveServiceItems = (serviceItemIds: string[], serviceItems: ServiceItemShape[]) => {
    this.props.save(serviceItems);
  };

  fetchServiceItems = (filter: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: GetServiceItemsOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }

    if (filter.type && filter.type.length !== 0) {
      options.type = filter.type;
    }

    return this._catalogService.getServiceItems(organisationId, options);
  };

  render() {
    const {
      selectedServiceItemIds,
      close,
      intl: { formatMessage },
      workspace,
      match: {
        params: { organisationId },
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
        render: (text, record) => (
          <span>
            {this._serviceOfferPageService.transformServiceType(record.type, formatMessage)}
          </span>
        ),
      },
    ];

    const datamarts = workspace(organisationId).datamarts;

    const fetchServiceItem = (serviceItemId: string) =>
      this._catalogService.findServiceItem(serviceItemId);

    return (
      <ServiceItemTableSelector
        actionBarTitle={formatMessage(messages.serviceItemSelectorTitle)}
        displayFiltering={true}
        displayTypeFilter={true}
        searchPlaceholder={formatMessage(messages.serviceItemSelectorSearchPlaceholder)}
        selectedIds={selectedServiceItemIds}
        fetchDataList={this.fetchServiceItems}
        fetchData={fetchServiceItem}
        columnsDefinitions={columns}
        save={this.saveServiceItems}
        close={close}
        datamarts={datamarts}
        messages={{
          audienceSegment: formatMessage(messages.audienceSegment),
          userAccountCompartment: formatMessage(messages.userAccountCompartment),
          serviceType: formatMessage(messages.serviceType),
          addElementText: formatMessage(messages.addElementText),
        }}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, ServiceItemSelectorProps>(
  connect(mapStateToProps, undefined),
  withRouter,
  injectIntl,
)(ServiceItemSelector);
