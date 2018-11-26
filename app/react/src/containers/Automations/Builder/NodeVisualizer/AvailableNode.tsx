import * as React from 'react';
import { McsIcon } from '../../../../components';
import { McsIconType } from '../../../../components/McsIcon';

interface AvailableNodeProps {
  icon: McsIconType;
  title: string;
  color: string;
}

class AvailableNode extends React.Component<AvailableNodeProps> {
  render() {
    return <div className="available-node">
    <div className="available-node-icon" style={{ backgroundColor: this.props.color }}>
      <McsIcon type={this.props.icon} className="available-node-icon-gyph"/>
     </div>
    <div className="available-node-text">{this.props.title}</div>
  </div>
  }
}

export default AvailableNode;
