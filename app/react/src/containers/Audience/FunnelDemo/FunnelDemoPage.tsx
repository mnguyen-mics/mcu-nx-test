import { Layout } from 'antd';
import * as React from 'react';


const { Content } = Layout;

class FunnelDemoPage extends React.Component {
  render() {
    return (<div className="ant-layout">
      <div className="ant-layout">
        <Content className="mcs-content-container"></Content>
      </div>
    </div>)
  }
}

export default FunnelDemoPage;
