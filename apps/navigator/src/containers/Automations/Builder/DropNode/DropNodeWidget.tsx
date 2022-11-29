import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine } from 'storm-react-diagrams';
import DropNodeModel from './DropNodeModel';
import AnchorPortWidget from './AnchorPortWidget/AnchorPortWidget';
import { ConnectDropTarget, DropTargetMonitor } from 'react-dnd';
import { compose } from 'recompose';
import DropTarget from 'react-dnd/lib/DropTarget';
import { TreeNodeOperations } from '../domain';
import { ScenarioNodeShape } from '../../../../models/automations/automations';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';

interface DropNodeProps {
  node: DropNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
}

interface DroppedItemProps {
  canDrop?: boolean;
  isOver?: boolean;
  connectDropTarget?: ConnectDropTarget;
  isDragging: boolean;
}

type Props = DropNodeProps & DroppedItemProps & InjectedThemeColorsProps;

interface State {
  hover: boolean;
}

const addinTarget = {
  drop(props: Props, monitor: DropTargetMonitor) {
    const item = monitor.getItem() as ScenarioNodeShape;
    props.treeNodeOperations.addNode(
      props.node.dropNode.parentNode.node.id,
      props.node.dropNode.outNode.node.id,
      item,
    );
  },
};

class DropNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  setPosition = (node: HTMLDivElement | null) => {
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top : 0;
    this.left = viewportOffset ? viewportOffset.left : 0;
  };

  render() {
    const { node, connectDropTarget, isDragging, isOver, colors } = this.props;

    let backgroundColor = node.getColor();
    let borderColor = node.getColor();

    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });

    if (isOver && isDragging) {
      backgroundColor = colors['mcs-info'];
      borderColor = colors['mcs-info'];
    }

    const opacity = isDragging ? 1 : 0;

    return (
      connectDropTarget &&
      connectDropTarget(
        <div className={'drop-container mcs-dropNodeWidget'}>
          <div
            className={'drop-area'}
            onMouseEnter={onHover('enter')}
            onMouseLeave={onHover('leave')}
          >
            <div
              className={'drop-node mcs-dropNodeWidget_area_node'}
              onMouseEnter={onHover('enter')}
              onMouseLeave={onHover('leave')}
              style={{
                width: node.getNodeSize().width,
                height: node.getNodeSize().height,
                borderWidth: node.getNodeSize().borderWidth,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                opacity,
              }}
            />
            <AnchorPortWidget node={node} />
          </div>
        </div>,
      )
    );
  }
}

export default compose<Props, DropNodeProps>(
  DropTarget(
    () => {
      return 'automation-node';
    },
    addinTarget,
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      isDragging: monitor.getItemType(),
    }),
  ),
  injectThemeColors,
)(DropNodeWidget);
