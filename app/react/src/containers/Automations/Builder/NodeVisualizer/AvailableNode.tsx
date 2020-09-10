import McsIcon, { McsIconType } from '../../../../components/McsIcon';
import React from 'react';
import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';
import { Icon } from 'antd';
import { ScenarioNodeShape } from '../../../../models/automations/automations';
import { generateNodeProperties } from '../domain';
import { isAbnNode } from '../AutomationNode/Edit/domain';
import { generateFakeId } from '../../../../utils/FakeIdHelper';
import { InjectedIntlProps } from 'react-intl';

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
  render() {
    const {
      node,
      connectDragSource,
      intl: { formatMessage },
    } = this.props;
    const nodeProperties = generateNodeProperties(node, formatMessage);

    const name = nodeProperties.title;
    const icon = nodeProperties.iconType;
    const color = nodeProperties.color;
    const iconAnt = nodeProperties.iconAnt;

    return (
      connectDragSource &&
      connectDragSource(
        <div className="available-node">
          <div
            className="available-node-icon"
            style={{ backgroundColor: color }}
          >
            {iconAnt ? (
              <Icon type={iconAnt} className="available-node-icon-gyph" />
            ) : (
              <McsIcon
                type={icon as McsIconType}
                className="available-node-icon-gyph"
              />
            )}
          </div>
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
