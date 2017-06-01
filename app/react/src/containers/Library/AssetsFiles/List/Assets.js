import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import AssetsActionbar from './AssetsActionbar';
import AssetsFilesTable from './AssetsTableView';

const { Content } = Layout;

class Assets extends Component {

  render() {
    return (
      <Layout>
        <AssetsActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <AssetsFilesTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Assets;
