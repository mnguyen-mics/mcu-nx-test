import * as React from 'react';
import { compose } from 'recompose';
import PlusNodeModel from './PlusNodeModel';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import {
  TreeNodeOperations,
  DragAndDropInterface,
  computeSchemaPathFromQueryPath,
  computeAdditionalNode,
  SchemaItem,
  MicsDiagramEngine,
} from '../../domain';
import { McsIcon, WindowBodyPortal } from '../../../../../components';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import ObjectNodeForm, { ObjectNodeFormProps } from '../../Edit/ObjectNodeForm';
import {
  ObjectNodeFormData,
  generateObjectNodeFromFormData,
  QUERY_DOCUMENT_INITIAL_VALUE,
} from '../../Edit/domain';
import { DropTargetMonitor, ConnectDropTarget, DropTarget } from 'react-dnd';
import { ObjectTreeExpressionNodeShape } from '../../../../../models/datamart/graphdb/QueryDocument';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import FourAnchorPortWidget from '../Common/FourAnchorPortWidget';
import messages from '../Common/messages';
import { FormattedMessage } from 'react-intl';

interface PlusNodeProps {
  node: PlusNodeModel;
  diagramEngine: MicsDiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (lock: boolean) => void;
  query?: ObjectTreeExpressionNodeShape;
  schema?: SchemaItem;
  isTrigger: boolean;
  isEdge: boolean;
  datamartId: string;
  runtimeSchemaId: string;
}

interface DroppedItemProps {
  canDrop?: boolean;
  isOver?: boolean;
  connectDropTarget?: ConnectDropTarget;
  isDragging?: boolean;
}

type Props = PlusNodeProps & DroppedItemProps & InjectedThemeColorsProps;

interface State {
  focus: boolean;
  hover: boolean;
}

const addinTarget = {
  drop(props: PlusNodeProps, monitor: DropTargetMonitor) {
    const releasedItem = monitor.getItem() as DragAndDropInterface;

    const releasedItemPath = releasedItem.path
      .split('.')
      .map(i => parseInt(i, 10));

    const hostObjectPath = computeSchemaPathFromQueryPath(
          props.query,
          props.node.treeNodePath,
          props.schema,
        );

    const newQuery = computeAdditionalNode(
      releasedItemPath,
      hostObjectPath.length,
      props.schema,
    );

    if (newQuery) {
      return props.treeNodeOperations.addNode(
        props.node.treeNodePath,
        newQuery,
      );
    }
  },
  canDrop(props: PlusNodeProps, monitor: DropTargetMonitor) {
    // compute path in schema and compare to the one sent from the grabbed item
    if (props.node.root && !props.query) {
      return true;
    } else if (props.node.root && props.query) {
      return false;
    }

    const itemTypeSchemaPath = computeSchemaPathFromQueryPath(
      props.query,
      props.node.treeNodePath,
      props.schema,
    ).join('.');
    const canDrop = (monitor.getItem() as DragAndDropInterface).path.startsWith(
      itemTypeSchemaPath,
    );

    return canDrop;
  },
};

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

  addObjectNode = () => {
    const { node, lockGlobalInteraction } = this.props;
    this.setState({ focus: false }, () => {
      // let computedSchemaPath = ['UserPoint'];
      lockGlobalInteraction(false);
      this.props.openNextDrawer<ObjectNodeFormProps>(ObjectNodeForm, {
        additionalProps: {
          close: this.props.closeNextDrawer,
          breadCrumbPaths: [{ name: node.objectTypeInfo!.name }],
          objectTypes: this.props.objectTypes,
          objectType: node.objectTypeInfo!,
          onSubmit: (e: ObjectNodeFormData) => {
            this.props.treeNodeOperations.addNode(
              node.treeNodePath,
              generateObjectNodeFromFormData(e),
            );
            this.props.closeNextDrawer();
          },
          initialValues: QUERY_DOCUMENT_INITIAL_VALUE,
          isTrigger: this.props.isTrigger,
          isEdge: this.props.isEdge,
          datamartId: this.props.datamartId,
          runtimeSchemaId: this.props.runtimeSchemaId
        },
        size: 'small',
      });
    });
  };

  addGroup = () => {
    const { treeNodeOperations, node, lockGlobalInteraction } = this.props;
    if (node.root) {
      treeNodeOperations.addNewGroupAsRoot();
      lockGlobalInteraction(false);
    } else {
      treeNodeOperations.addNode(node.treeNodePath, {
        type: 'GROUP',
        boolean_operator: 'OR',
        expressions: [],
      });
      lockGlobalInteraction(false);
    }
  };

  pasteNode = () => {
    const {node, treeNodeOperations, lockGlobalInteraction} = this.props;

    const canPasteObject = this.canPasteHere();
    if (canPasteObject) {
      if (node.objectOrGroupNode && node.objectOrGroupNode.type === 'GROUP') {
        const newObject = {
          ...node.objectOrGroupNode
        }
        newObject.expressions.push(canPasteObject)
        treeNodeOperations.updateNode(node.treeNodePath, newObject);
        this.props.diagramEngine.emptyClipboard()
      }
      
      lockGlobalInteraction(false);
    }
  }

  canPasteHere = (): ObjectTreeExpressionNodeShape | undefined => {
    if (
      !this.props.node.root &&
      this.props.diagramEngine.isCopying()
    ) {
      const copying = this.props.diagramEngine.getCopiedValue();
      if (
        copying &&
        copying.copiedObjectType &&
        copying.objectType &&
        copying.objectType === 'UserPoint' &&
        copying.treeNodePath && copying.treeNodePath.length === this.props.node.treeNodePath.length &&
        copying.treeNodePath !== this.props.node.treeNodePath
      ) {
        return copying.copiedObjectType;
      }
    }
    return;
  };

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

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    const opacity = isDragging && !canDrop ? 0.3 : 1;

    let backgroundColor = '#ffffff';
    let color = node.getColor();
    let borderColor = node.getColor();

    if (this.state.hover) {
      backgroundColor = node.getColor();
      color = '#ffffff';
    }

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

    const canPaste = this.canPasteHere();

    return (
      connectDropTarget &&
      connectDropTarget(
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
            <McsIcon type="plus" />
          </div>

          <FourAnchorPortWidget node={node} />

          {this.state.focus && (
            <WindowBodyPortal>
              <div className="query-builder">
                <div
                  onClick={handleClickOnPlus}
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
                  className={`plus-button ${
                    this.state.focus ? 'plus-clicked' : ''
                  }`}
                  style={{
                    ...node.getSize(),
                    backgroundColor: node.getColor(),
                    color: '#ffffff',
                    borderColor: node.getColor(),
                    top:
                      this.top - node.getSize().height * ((1 - zoomRatio) / 2),
                    left:
                      this.left - node.getSize().width * ((1 - zoomRatio) / 2),
                    position: 'absolute',
                    zIndex: 1002,
                    transform: `scale(${zoomRatio})`,
                  }}
                  onClick={handleClickOnPlus}
                >
                  <McsIcon type="plus" />
                </span>
                <div
                  className="boolean-menu"
                  style={{
                    top: this.top,
                    left: this.left + node.getSize().width,
                    zIndex: 1001,
                  }}
                >
                  {(!node.root ||
                    Object.keys(this.props.diagramEngine.diagramModel.nodes)
                      .length === 1) && (
                    <div
                      onClick={this.addObjectNode}
                      className="boolean-menu-item"
                    >
                      <FormattedMessage {...messages.object} />
                    </div>
                  )}
                  {(node.root ||
                    (node.objectOrGroupNode &&
                      node.objectOrGroupNode.type === 'GROUP')) && (
                    <div onClick={this.addGroup} className="boolean-menu-item">
                      <FormattedMessage {...messages.group} />
                    </div>
                  )}
                  {
                    canPaste && (
                      <div onClick={this.pasteNode} className="boolean-menu-item">
                        <FormattedMessage {...messages.paste} />
                      </div>
                    )
                  }
                </div>
              </div>
            </WindowBodyPortal>
          )}
        </div>,
      )
    );
  }
}

export default compose<Props & InjectedDrawerProps, PlusNodeProps>(
  DropTarget(
    () => {
      return ['object', 'field'];
    },
    addinTarget,
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
