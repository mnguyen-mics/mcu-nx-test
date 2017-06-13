import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import KeywordActionBar from './KeywordActionBar';
import KeywordListsTable from './KeywordTable';

const { Content } = Layout;

class Keywords extends Component {

  render() {
    return (
      <Layout>
        <KeywordActionBar {...this.props} />
        <Content>
          <ScrollComponent>
            <KeywordListsTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Keywords;
