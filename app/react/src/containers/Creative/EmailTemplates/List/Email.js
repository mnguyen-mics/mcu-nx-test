import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import EmailActionBar from './EmailActionBar';
import CreativeEmailsTable from './EmailList';

const { Content } = Layout;

class EmailTemplates extends Component {

  render() {
    return (
      <Layout>
        <EmailActionBar {...this.props} />
        <Content>
          <ScrollComponent>
            <CreativeEmailsTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default EmailTemplates;
