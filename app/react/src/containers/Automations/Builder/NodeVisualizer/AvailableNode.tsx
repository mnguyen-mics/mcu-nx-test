import McsIcon, { McsIconType } from '../../../../components/McsIcon';
import React from 'react';

interface AvailableNodeProps {
  title: string;
  icon: McsIconType;
  color: string;
}

class AvailableNode extends React.Component<AvailableNodeProps> {
  render() {
    const { title, icon, color } = this.props;

    return (
      <div className="available-node">
        <div className="available-node-icon" style={{ backgroundColor: color }}>
          <McsIcon type={icon} className="available-node-icon-gyph" />
        </div>
        <div className="available-node-text">{title}</div>
      </div>
    );
  }
}

export default AvailableNode;
