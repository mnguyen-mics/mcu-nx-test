import * as React from 'react';
import { Layout, Card } from 'antd';
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';

const { Content } = Layout;

interface MyServiceCatalogPageProps {}

type Props = MyServiceCatalogPageProps;

class MyServiceCatalogPage extends React.Component<Props> {
  render() {
    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <br />
          <Card>
            <div className='mcs-card-header mcs-card-title'>
              <span className='mcs-card-title'>
                <FormattedMessage {...messages.myServiceCatalogTitle} />
              </span>
            </div>
          </Card>
        </Content>
      </div>
    );
  }
}

export default MyServiceCatalogPage;
