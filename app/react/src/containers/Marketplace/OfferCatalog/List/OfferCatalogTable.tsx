import * as React from 'react';
import { Layout } from 'antd';
import {
    TableViewFilters,
  } from '../../../../components/TableView/index';
import CatalogService from '../../../../services/CatalogService';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { ServiceItemShape } from '../../../../models/servicemanagement/PublicServiceItemResource';
import { compose } from 'recompose';
import OrgLogo from '../../../Logo/OrgLogo';

const { Content } = Layout;

const dataColumns = [
  {
    intlMessage: {
      id: 'display.metrics.logo',
      defaultMessage: 'Provider',
    },
    key: 'provider_id',
    isHideable: false,
    render: (text: any) => (
      <span className={"mcs-offerCatalogTable_providerLogo"}>
          <OrgLogo organisationId={text} />
      </span>
        
    ),
  },
  {
    intlMessage: {
      id: 'display.metrics.name',
      defaultMessage: 'Name'
    },
    key: 'name',
    isHideable: false,
    render: (text: any) => text,
  }
];

interface State {
  loading: boolean;
  dataSource: ServiceItemShape[];
}

interface OfferCatalogTableProps {
}

type Props = 
OfferCatalogTableProps &
  InjectedNotificationProps


class OfferCatalogTable extends React.Component<Props, State> {


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
  
    CatalogService.findAvailableServiceItems()
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
            <div className="ant-layout">
            <Content className="mcs-content-container">
              <div className="mcs-table-container mcs-offerCatalogTable">
                <TableViewFilters
                  columns={dataColumns}
                  dataSource={dataSource}
                  loading={loading}
                />
              </div>
            </Content>
          </div>
        )
    }
}


export default compose<Props, OfferCatalogTableProps>(
  injectNotifications,
)(OfferCatalogTable);