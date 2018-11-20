import * as React from 'react';
import { DiagramEngine } from 'storm-react-diagrams';
import { compose } from 'recompose';
import AutomationNodeModel from './AutomationNodeModel';
import { ConnectDropTarget, DropTarget } from 'react-dnd';
import { SchemaItem } from '../../../QueryTool/JSONOTQL/domain';
import { ObjectTreeExpressionNodeShape } from '../../../../models/datamart/graphdb/QueryDocument';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
import injectDrawer, { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { McsIcon } from '../../../../components';
import FourAnchorPortWidget from '../../../QueryTool/JSONOTQL/Diagram/Common/FourAnchorPortWidget';

interface AutomationNodeProps {
  node: AutomationNodeModel;
  diagramEngine: DiagramEngine;
  lockGlobalInteraction: (lock: boolean) => void;
  query?: ObjectTreeExpressionNodeShape;
  schema?: SchemaItem;
  isTrigger: boolean;
}

interface DroppedItemProps {
  canDrop?: boolean;
  isOver?: boolean;
  connectDropTarget?: ConnectDropTarget;
  isDragging?: boolean;
}

type Props = AutomationNodeProps & DroppedItemProps & InjectedThemeColorsProps;

interface State {
  focus: boolean;
  hover: boolean;
}

class PlusNodeWidget extends React.Component<
  Props & InjectedDrawerProps,
  State
> {
  top: number = 0;
  left: number = 0;

  constructor(props: Props & InjectedDrawerProps) {
    super(props);
    this.state = { focus: false, hover: false };
  }

  setPosition = (node: HTMLDivElement | null) => {
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top : 0;
    this.left = viewportOffset ? viewportOffset.left : 0;
  };

  render() {
    const {
      node,
      isDragging,
      connectDropTarget,
      canDrop,
      isOver,
      colors,
    } = this.props;

    const handleClickOnPlus = () => {
      this.props.lockGlobalInteraction(!this.state.focus);
      this.setState({ focus: !this.state.focus });
    };

    const onHover = (type: 'enter' | 'leave') => () => {
      this.setState({ hover: type === 'enter' ? true : false });
    };

    const opacity = isDragging && !canDrop ? 0.3 : 1;

    let backgroundColor = node.getColor();
    let color = '#ffffff';
    let borderColor = node.getColor();

    if (canDrop && !isOver) {
      backgroundColor = colors['mcs-info'];
      color = '#ffffff';
      borderColor = colors['mcs-info'];
    }

    if (isOver && canDrop) {
      backgroundColor = '#ffffff';
      color = node.getColor();
      borderColor = node.getColor();
    }

    return (
      connectDropTarget &&
      connectDropTarget(
        <div className="node-body">
        <div
          className="plus-node noFocus"
          style={{ opacity }}
          ref={ref => this.setPosition(ref)}
        >
          <div
            style={{
              width: node.getSize().width,
              height: node.getSize().height,
              borderWidth: node.getSize().borderWidth,
              borderColor: borderColor,
              float: 'left',
              color: color,
              backgroundColor: backgroundColor,
            }}
            onClick={handleClickOnPlus}
            onMouseEnter={onHover('enter')}
            onMouseLeave={onHover('leave')}
            className={`plus-button ${this.state.focus ? 'plus-clicked' : ''}`}
          >
            <McsIcon type={node.iconType} />
          </div>

          <FourAnchorPortWidget node={node} />

        </div>
        <div className="node-content">{node.title}</div>        
        </div>,
      )
    );
  }
}

export default compose<Props & InjectedDrawerProps, AutomationNodeProps>(
  DropTarget(
    () => {return [];},
    {},
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      isDragging: !!monitor.getItemType(),
    }),
  ),
  injectDrawer,
  injectThemeColors,
)(PlusNodeWidget);
