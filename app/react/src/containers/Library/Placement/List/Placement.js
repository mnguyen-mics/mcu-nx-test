import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import PlacementListsActionbar from './PlacementActionBar';
import PlacementListTable from './PlacementTable';

const { Content } = Layout;

class Placements extends Component {

  render() {
    return (
      <Layout>
        <PlacementListsActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <PlacementListTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Placements;
