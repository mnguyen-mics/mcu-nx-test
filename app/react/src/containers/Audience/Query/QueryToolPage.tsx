import * as React from 'react';
import { Layout } from 'antd';
import ActionBar from '../../../components/ActionBar';
import TitleAndStatusHeader from '../../../components/TitleAndStatusHeader';

const { Content } = Layout;

export interface Props {}

export default class QueryToolPage extends React.Component<Props> {
  render() {
    return (
      <Layout>
        <ActionBar paths={[{ name: 'Query Tool' }]} />
        <Content className="mcs-content-container">
          Query tool
        </Content>
      </Layout>
    );
  }
}
