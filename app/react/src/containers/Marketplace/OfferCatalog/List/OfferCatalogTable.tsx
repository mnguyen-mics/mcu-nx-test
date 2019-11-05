import * as React from 'react';

import messages from './messages';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
    TableViewFilters,
  } from '../../../../components/TableView/index';
import { ICatalogService } from '../../../../services/CatalogService';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { ServiceItemShape } from '../../../../models/servicemanagement/PublicServiceItemResource';
import { compose } from 'recompose';
import OrgLogo from '../../../Logo/OrgLogo';
import { DataColumnDefinition } from '../../../../components/TableView/TableView';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';

interface State {
  loading: boolean;
  dataSource: ServiceItemShape[];
}

type Props = 
InjectedIntlProps &
  InjectedNotificationProps

const dataColumns : Array<DataColumnDefinition<ServiceItemShape>> = [
  {
    intlMessage: messages.providerLabel,
    key: 'provider_id',
    isVisibleByDefault: true,
    isHideable: false,
    render: (text: string) => (
      <span className={"mcs-offerCatalogTable_providerLogo"}>
          <OrgLogo organisationId={text} />
      </span>
    ),
  },
  {
    intlMessage: messages.nameLabel,
    key: 'name',
    isVisibleByDefault: true,
    isHideable: false,
    render: (text: string) => text,
  },
];

class OfferCatalogTable extends React.Component<Props, State> {

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      dataSource: []
    };
  }
  
  componentDidMount() {
    this.setState({
      loading: true,
    });
  
    this._catalogService.findAvailableServiceItems()
    .then(res => {
      this.setState({
        loading: false,
        dataSource: res.data
      });
    })
    .catch(err => {
      this.setState({ loading: false });
      this.props.notifyError(err);
    })
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
        )
    }
}

export default compose<Props, {}>(
  injectIntl,
  injectNotifications,
)(OfferCatalogTable);
