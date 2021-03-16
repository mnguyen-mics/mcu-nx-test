import * as React from 'react';
import { AreaChartOutlined} from '@ant-design/icons';

class FunnelEmptyState extends React.Component {
  render() {
    return (<div className="mcs-funnelEmptyState">
    <AreaChartOutlined className="mcs-funnelEmptyState_icon" />
      <p className="mcs-funnelEmptyState_desc">Set up your steps to see the funnel</p>
    </div>)
  }
}

export default FunnelEmptyState;