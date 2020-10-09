import { Actionbar } from '@mediarithmics-private/mcs-components-library';
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
    const breadcrumbPaths = [
      {
        key: 'Funnel Builder',
        name: 'Funnel Builder'
      }
    ];
    return (
      <div className="ant-layout">
        <Actionbar paths={breadcrumbPaths} />
        <Content className="mcs-content-container">
          <FunnelWrapper datamartId={selectedDatamartId} />
        </Content>
      </div>)
  }
}

export default compose(
  withDatamartSelector,
)(FunnelDemoPage);