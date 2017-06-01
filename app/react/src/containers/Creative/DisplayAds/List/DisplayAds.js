import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import ListCreativesDisplay from './DisplayAdsActionBar';
import CreativeDisplayTable from './DisplayAdsList';

const { Content } = Layout;

class DisplayAds extends Component {

  render() {
    return (
      <Layout>
        <ListCreativesDisplay {...this.props} />
        <Content>
          <ScrollComponent>
            <CreativeDisplayTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default DisplayAds;
