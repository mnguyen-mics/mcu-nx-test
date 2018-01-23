import * as React from 'react';
import { Layout } from 'antd';
import ActionBar from '../../../components/ActionBar';
import ContentHeader from '../../../components/ContentHeader';
import { FormattedMessage } from 'react-intl';

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
        </Content>
      </Layout>
    );
  }
}
