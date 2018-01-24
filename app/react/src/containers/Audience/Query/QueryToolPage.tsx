import * as React from 'react';
import { Layout } from 'antd';
import ActionBar from '../../../components/ActionBar';
import ContentHeader from '../../../components/ContentHeader';
import { FormattedMessage } from 'react-intl';
import { CounterDashboard } from '../../../components/Counter/index';

const { Content } = Layout;

export interface Props {}

export default class QueryToolPage extends React.Component<Props> {
  render() {
    return (
      <Layout>
        <ActionBar paths={[{ name: 'Query Tool' }]} />
        <Content className="mcs-content-container">
          <ContentHeader
            title={
              <FormattedMessage
                id="query-tool-page-title"
                defaultMessage="Query Tool"
              />
            }
          />          
          <CounterDashboard counters={[
            {
              iconType: 'full-users',
              title: 'User Points',
              value: 200692,
            },
            {
              iconType: 'users',
              title: 'User Points',
              value: 200692200692,                
            },
            {
              iconType: 'display',
              title: 'User Points',
              value: undefined,                
            },
            {
              iconType: 'email-inverted',
              title: 'User Points',
              value: 200692200692,                
              loading: true,
            },
          ]}/>
                  
        </Content>
      </Layout>
    );
  }
}
