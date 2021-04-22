import React from 'react';
import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';

import { ScenarioNodeShape } from '../../../../models/automations/automations';
import { generateNodeProperties, NodeProperties } from '../domain';
import { isAbnNode } from '../AutomationNode/Edit/domain';
import { generateFakeId } from '../../../../utils/FakeIdHelper';
import { InjectedIntlProps } from 'react-intl';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

interface AvailableNodeObjectProps {
  node: ScenarioNodeShape;
  connectDragSource?: ConnectDragSource;
  isDragging?: boolean;
  isDropped?: boolean;
}

type AvailableNodeProps = AvailableNodeObjectProps & InjectedIntlProps;

const fieldSource = {
  beginDrag(props: AvailableNodeProps) {
    const {
      intl: { formatMessage },
    } = props;
    const nodeProperties = generateNodeProperties(props.node, formatMessage);

    return {
      ...props.node,
      id: generateFakeId(),
      icon: nodeProperties.iconType,
      iconAnt: nodeProperties.iconAnt,
      color: nodeProperties.color,
      branch_number: isAbnNode(props.node) ? props.node.branch_number : 0,
    };
  },
};

class AvailableNode extends React.Component<AvailableNodeProps> {
  getIcon = (nodeProperties: NodeProperties) => {
    const icon = nodeProperties.iconAnt ? 
      nodeProperties.iconAnt : (
      <McsIcon
        type={nodeProperties.iconType as McsIconType}
        className="available-node-icon-gyph"
      />
    );

    if (nodeProperties.iconAssetUrl) {
      return (
        <div className="available-node-icon">
          <img
            className="available-node-icon-img"
            src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${
              nodeProperties.iconAssetUrl
            }`}
          />
        </div>
      );
    } else
      return (
        <div
          className="available-node-icon"
          style={{ backgroundColor: nodeProperties.color }}
        >
          {icon}
        </div>
      );
  };

  render() {
    const {
      node,
      connectDragSource,
      intl: { formatMessage },
    } = this.props;
    const nodeProperties: NodeProperties = generateNodeProperties(
      node,
      formatMessage,
    );

    const name = nodeProperties.title;

    const iconElement = this.getIcon(nodeProperties);

    return (
      connectDragSource &&
      connectDragSource(
        <div className="available-node mcs-availableNode">
          {iconElement}
          <div className="available-node-text">{name}</div>
        </div>,
      )
    );
  }
}

export default DragSource(
  () => 'automation-node',
  fieldSource,
  (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(AvailableNode);
