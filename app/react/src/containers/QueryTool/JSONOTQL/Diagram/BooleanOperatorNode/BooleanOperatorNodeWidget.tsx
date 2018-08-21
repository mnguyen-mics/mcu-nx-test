import * as React from 'react';
import cuid from 'cuid';
import { CSSTransition } from 'react-transition-group';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import BooleanOperatorNodeModel from './BooleanOperatorNodeModel';
import { TreeNodeOperations } from '../../domain';
import WindowBodyPortal from '../../../../../components/WindowBodyPortal';
import { DropTarget, ConnectDropTarget } from 'react-dnd';
import { compose } from 'recompose';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import FourAnchorPortWidget from '../Common/FourAnchorPortWidget';

const addinTarget = {
  canDrop() {
    return false
   },
};

interface DroppedItemProps {
  connectDropTarget?: ConnectDropTarget;
  isDragging: boolean;
}

interface BooleanOperatorNodeWidgetProps {
  node: BooleanOperatorNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  lockGlobalInteraction: (lock: boolean) => void;
}

type Props = DroppedItemProps & BooleanOperatorNodeWidgetProps & InjectedThemeColorsProps;
interface State {
  hover: boolean;
  focus: boolean;
}

class BooleanOperatorNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
      focus: false,
    };
  }

  setPosition = (node: HTMLDivElement | null) => {
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top : 0;
    this.left = viewportOffset ? viewportOffset.left : 0;
  };

  changeBooleanOperator = (operator: 'AND' | 'OR', negation: boolean) => () => {
    const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
    lockGlobalInteraction(false);
    this.setState({ focus: false });
    return treeNodeOperations.updateNode(node.treeNodePath, {
      ...node.objectOrGroupNode,
      negation: negation,
      boolean_operator: operator,
    });
  };

  removeGroup = () => {
    const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
    this.setState({ focus: false });
    lockGlobalInteraction(false);
    return treeNodeOperations.deleteNode(node.treeNodePath);
  };

  render() {
    const { node, connectDropTarget, isDragging } = this.props;
    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });
    const onClick = () => {
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.props.lockGlobalInteraction(!this.state.focus);
      this.setState({ focus: !this.state.focus });
    };

    const setRef = (ref: HTMLDivElement | null) => this.setPosition(ref);
    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    // const isActive = isOver && canDrop;
    let backgroundColor = '#ffffff';

    if (this.state.hover) {
      backgroundColor = node.getColor()
    } 

    const opacity = isDragging ? 0.3 : 1;

    return connectDropTarget &&
    connectDropTarget(
      <div id={this.id} ref={setRef} style={{opacity}}>
        <span
          className="boolean-node"
          style={{
            ...node.getSize(),
            backgroundColor: backgroundColor,
            color: this.state.hover ? '#ffffff' : node.getColor(),
            borderColor: node.getColor(),
          }}
          onMouseEnter={onHover('enter')}
          onMouseLeave={onHover('leave')}
          onClick={onClick}
        >
          {node.objectOrGroupNode.boolean_operator}
          
          <FourAnchorPortWidget node={node} />

        </span>

        {this.state.focus && (
          <WindowBodyPortal>
            <div className="query-builder">
              <div
                onClick={onClick}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'black',
                  zIndex: 1000,
                  opacity: 0.6,
                }}
              />
              <span
                className="boolean-node"
                style={{
                  ...node.getSize(),
                  backgroundColor: node.getColor(),
                  color: '#ffffff',
                  borderColor: node.getColor(),
                  top: this.top - node.getSize().height * ((1 - zoomRatio) / 2),
                  left:
                    this.left - node.getSize().width * ((1 - zoomRatio) / 2),
                  position: 'absolute',
                  zIndex: 1002,
                  transform: `scale(${zoomRatio})`,
                }}
              >
                {node.objectOrGroupNode.boolean_operator}
                <div
                  style={{
                    position: 'absolute',
                    top:
                      ((node.getSize().height +
                        node.getSize().borderWidth / 2) /
                        2) *
                      zoomRatio,
                    left:
                      ((node.getSize().width + node.getSize().borderWidth / 2) /
                        2) *
                      zoomRatio,
                  }}
                >
                  <PortWidget name="center" node={this.props.node} />
                </div>
              </span>
              <CSSTransition
                timeout={500}
                classNames={'fade'}
                in={this.state.focus}
              >
                <div
                  className="boolean-menu"
                  style={{
                    top: this.top,
                    left: this.left + node.getSize().width * zoomRatio,
                    zIndex: 1001,
                  }}
                >
                  <div
                    onClick={this.changeBooleanOperator(
                      node.objectOrGroupNode.boolean_operator === 'AND'
                        ? 'OR'
                        : 'AND',
                      false,
                    )}
                    className="boolean-menu-item"
                  >
                    {node.objectOrGroupNode.boolean_operator === 'AND'
                      ? 'OR'
                      : 'AND'}
                  </div>
                  <div
                    onClick={this.changeBooleanOperator(
                      'AND',
                      node.objectOrGroupNode.boolean_operator === 'AND' &&
                      node.objectOrGroupNode.negation === true
                        ? false
                        : true,
                    )}
                    className="boolean-menu-item"
                  >
                    {node.objectOrGroupNode.boolean_operator === 'AND' &&
                    node.objectOrGroupNode.negation === true
                      ? 'AND'
                      : 'AND NOT'}
                  </div>
                  <div
                    onClick={this.changeBooleanOperator(
                      'OR',
                      node.objectOrGroupNode.boolean_operator === 'OR' &&
                      node.objectOrGroupNode.negation === true
                        ? false
                        : true,
                    )}
                    className="boolean-menu-item"
                  >
                    {node.objectOrGroupNode.boolean_operator === 'OR' &&
                    node.objectOrGroupNode.negation === true
                      ? 'OR'
                      : 'OR NOT'}
                  </div>
                  <div onClick={this.removeGroup} className="boolean-menu-item">
                    Remove
                  </div>
                </div>
              </CSSTransition>
            </div>
          </WindowBodyPortal>
        )}
      </div>
    );
  }
}

export default compose<Props, BooleanOperatorNodeWidgetProps>(
  DropTarget(
    () => {
      return 'none';
    },
    addinTarget,
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      isDragging: !!monitor.getItemType()
    }),
  ),
  injectThemeColors
)(BooleanOperatorNodeWidget);
