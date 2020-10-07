import { Layout } from 'antd';
import * as React from 'react';
import { compose } from 'recompose';
import FunnelWrapper from '../../../components/Funnel/FunnelWrapper';
import { withDatamartSelector, WithDatamartSelectorProps } from '../../Datamart/WithDatamartSelector';

const { Content } = Layout;

type JoinedProps = WithDatamartSelectorProps;

class FunnelDemoPage extends React.Component<JoinedProps> {
  render() {
    const { selectedDatamartId } = this.props;

    return (<div className="ant-layout">
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <FunnelWrapper datamartId={selectedDatamartId} />
        </Content>
      </div>
    </div>)
  }
}

export default compose(
  withDatamartSelector,
)(FunnelDemoPage);