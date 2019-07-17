import * as React from 'react';
import { Layout } from 'antd';
import OfferCatalogTable from './OfferCatalogTable';

const { Content } = Layout;

class OfferCatalogPage extends React.Component  {
    render() {
        return (
            <div className="ant-layout">
              <Content className="mcs-content-container" >
              <OfferCatalogTable />
              </Content>
            </div>
        )
    }
}

export default OfferCatalogPage

  