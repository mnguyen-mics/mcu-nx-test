import * as React from 'react';
import { Layout } from 'antd';
import {
    TableViewFilters,
  } from '../../../../components/TableView/index';

const { Content } = Layout;
const dataColumns = [
    {
      intlMessage: {
        id: 'display.metrics.name',
        defaultMessage: 'Provider'
      },
      key: 'provider',
      isHideable: false,
      render: (text: any) => text,
    },
    {
      intlMessage: {
        id: 'display.metrics.name',
        defaultMessage: 'Name'
      },
      key: 'name',
      isHideable: false,
      render: (text: any) => text,
    },
    {
      intlMessage: {
        id: 'display.metrics.name',
        defaultMessage: 'Type'
      },
      key: 'type',
      isVisibleByDefault: true,
      isHideable: true,
      render: (text: any) => text,
    }
  ];


const dataSource = [
  {
    provider: "Fnac",
    name: "Service item name",
    type: "service item type"
  },
  {
    provider: "Fnac",
    name: "Service item name",
    type: "service item type"
  },
  {
    provider: "Fnac",
    name: "Service item name",
    type: "service item type"
  }
]

class OfferCatalogPage extends React.Component  {
    
    render() {
        return (
            <div className="ant-layout">
            <Content className="mcs-content-container">
              <div className="mcs-table-container">
                <TableViewFilters
                  columns={dataColumns}
                  dataSource={dataSource}
                />
              </div>
            </Content>
          </div>
        )
    }
}

export default OfferCatalogPage

  