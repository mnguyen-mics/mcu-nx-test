import * as React from 'react';
import cuid from 'cuid';
import { CSSTransition } from 'react-transition-group';
import BooleanOperatorNodeModel from './BooleanOperatorNodeModel';
import { TreeNodeOperations, MicsDiagramEngine } from '../../domain';
import WindowBodyPortal from '../../../../../components/WindowBodyPortal';
import { DropTarget, ConnectDropTarget } from 'react-dnd';
import { compose } from 'recompose';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import FourAnchorPortWidget from '../Common/FourAnchorPortWidget';
import { FormattedMessage } from 'react-intl';
import messages from '../Common/messages';
import {
  QueryBooleanOperator,
  ObjectTreeExpressionNodeShape,
} from '../../../../../models/datamart/graphdb/QueryDocument';

const addinTarget = {
  canDrop() {
    return false;
  },
};

interface DroppedItemProps {
  connectDropTarget?: ConnectDropTarget;
  isDragging: boolean;
}

interface BooleanOperatorNodeWidgetProps {
  node: BooleanOperatorNodeModel;
  diagramEngine: MicsDiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  lockGlobalInteraction: (lock: boolean) => void;
}

type OperatorName = 'AND' | 'OR' | 'AND_NOT' | 'OR_NOT';

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

  changeBooleanOperator =
    (operator: { booleanOperator: QueryBooleanOperator; negation: boolean }) => () => {
      const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
      lockGlobalInteraction(false);
      this.setState({ focus: false });
      return treeNodeOperations.updateNode(node.treeNodePath, {
        ...node.objectOrGroupNode,
        negation: operator.negation,
        boolean_operator: operator.booleanOperator,
      });
    };

  removeGroup = () => {
    const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
    this.setState({ focus: false });
    lockGlobalInteraction(false);
    return treeNodeOperations.deleteNode(node.treeNodePath);
  };

  copyNode = () => {
    const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
    this.setState({ focus: false }, () => {
      lockGlobalInteraction(false);
      if (this.props.node.objectOrGroupNode.type === 'GROUP') {
        treeNodeOperations.copyNode(node.treeNodePath, 'UserPoint', this.props.node.treeNodePath);
      }
    });
  };

  cutNode = () => {
    const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
    this.setState({ focus: false }, () => {
      lockGlobalInteraction(false);
      if (this.props.node.objectOrGroupNode.type === 'GROUP') {
        treeNodeOperations.copyNode(node.treeNodePath, 'UserPoint', this.props.node.treeNodePath);
        treeNodeOperations.deleteNode(node.treeNodePath);
      }
    });
  };

  pasteNode = () => {
    const { node, treeNodeOperations, lockGlobalInteraction } = this.props;
    const canPaste = this.canPasteHere();
    const objectTree = canPaste ? { ...canPaste } : undefined;
    if (objectTree) {
      this.setState({ focus: false }, () => {
        lockGlobalInteraction(false);
        if (node.objectOrGroupNode.type === 'GROUP') {
          const newObject = {
            ...node.objectOrGroupNode,
          };
          const newObjectTree = {
            ...objectTree,
          };
          newObject.expressions.push(newObjectTree);
          treeNodeOperations.updateNode(node.treeNodePath, newObject);
        }
        this.props.diagramEngine.emptyClipboard();
      });
    }
  };

  canPasteHere = (): ObjectTreeExpressionNodeShape | undefined => {
    if (
      this.props.node.objectOrGroupNode.type === 'GROUP' &&
      this.props.diagramEngine.isCopying()
    ) {
      const copying = this.props.diagramEngine.getCopiedValue();
      if (
        copying &&
        copying.copiedObjectType &&
        copying.objectType &&
        copying.objectType === 'UserPoint' &&
        copying.treeNodePath !== this.props.node.treeNodePath
      ) {
        return copying.copiedObjectType;
      }
    }
    return;
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
      backgroundColor = node.getColor();
    }

    const opacity = isDragging ? 0.3 : 1;

    const operators: {
      readonly [key in OperatorName]: {
        booleanOperator: QueryBooleanOperator;
        negation: boolean;
      };
    } = {
      AND: { booleanOperator: 'AND', negation: false },
      AND_NOT: { booleanOperator: 'AND', negation: true },
      OR: { booleanOperator: 'OR', negation: false },
      OR_NOT: { booleanOperator: 'OR', negation: true },
    };

    const editMenu: React.ReactNode[] = [];

    if (this.props.diagramEngine.isCopying()) {
      if (this.canPasteHere()) {
        editMenu.push(
          <div onClick={this.pasteNode} className='boolean-menu-item'>
            <FormattedMessage {...messages.paste} />
          </div>,
        );
      }
    } else {
      if (this.props.node.objectOrGroupNode.type === 'GROUP') {
        editMenu.push(
          <div onClick={this.copyNode} className='boolean-menu-item'>
            <FormattedMessage {...messages.copy} />
          </div>,
        );
        editMenu.push(
          <div onClick={this.cutNode} className='boolean-menu-item'>
            <FormattedMessage {...messages.cut} />
          </div>,
        );
      }
    }

    editMenu.push(
      <div onClick={this.removeGroup} className='boolean-menu-item'>
        <FormattedMessage {...messages.remove} />
      </div>,
    );

    return (
      connectDropTarget &&
      connectDropTarget(
        <div id={this.id} ref={setRef} style={{ opacity }}>
          <span
            className='boolean-node'
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
              <div className='query-builder'>
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
                  className='boolean-node'
                  style={{
                    ...node.getSize(),
                    backgroundColor: node.getColor(),
                    color: '#ffffff',
                    borderColor: node.getColor(),
                    top: this.top - node.getSize().height * ((1 - zoomRatio) / 2),
                    left: this.left - node.getSize().width * ((1 - zoomRatio) / 2),
                    position: 'absolute',
                    zIndex: 1002,
                    transform: `scale(${zoomRatio})`,
                  }}
                >
                  {node.objectOrGroupNode.boolean_operator}
                </span>
                <CSSTransition timeout={500} classNames={'fade'} in={this.state.focus}>
                  <div
                    className='boolean-menu'
                    style={{
                      top: this.top,
                      left: this.left + node.getSize().width * zoomRatio,
                      zIndex: 1001,
                    }}
                  >
                    {Object.keys(operators)
                      .filter((opName: OperatorName) => {
                        return (
                          operators[opName].booleanOperator !==
                            this.props.node.objectOrGroupNode.boolean_operator ||
                          operators[opName].negation !==
                            (this.props.node.objectOrGroupNode.negation || false)
                        );
                      })
                      .map((opName: OperatorName) => {
                        return (
                          <div
                            onClick={this.changeBooleanOperator(operators[opName])}
                            className='boolean-menu-item'
                            key={opName}
                          >
                            <FormattedMessage {...messages[opName]} />
                          </div>
                        );
                      })}
                    {editMenu}
                  </div>
                </CSSTransition>
              </div>
            </WindowBodyPortal>
          )}
        </div>,
      )
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
      isDragging: !!monitor.getItemType(),
    }),
  ),
  injectThemeColors,
)(BooleanOperatorNodeWidget);
