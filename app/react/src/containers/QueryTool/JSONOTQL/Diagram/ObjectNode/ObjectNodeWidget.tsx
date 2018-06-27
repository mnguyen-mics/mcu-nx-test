import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import { compose } from 'recompose';
import ObjectNodeModel from './ObjectNodeModel';
import { RenderInBody } from '../../../../../components';
import { TreeNodeOperations, DragAndDropInterface, computeSchemaPathFromQueryPath, computeAdditionalNode, SchemaItem } from '../../domain';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import ObjectNodeForm, { ObjectNodeFormProps } from '../../Edit/ObjectNodeForm';
import {
  ObjectNodeFormData,
  generateObjectNodeFromFormData,
  generateFormDataFromObjectNode,
  FrequencyConverter,
} from '../../Edit/domain';
import { injectIntl, InjectedIntlProps,  } from 'react-intl';
import { frequencyModeMessageMap } from '../../messages';
import { DropTarget, ConnectDropTarget, DropTargetMonitor } from 'react-dnd';
import { ObjectTreeExpressionNodeShape } from '../../../../../models/datamart/graphdb/QueryDocument';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';

interface ObjectNodeWidgetProps {
  node: ObjectNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (lock: boolean) => void;
  query?: ObjectTreeExpressionNodeShape;
  schema?: SchemaItem;
}

interface State {
  focus: boolean;
  hover: boolean;
}

const addinTarget = {
  drop(props: Props, monitor: DropTargetMonitor) {
    const releasedItem = monitor.getItem() as DragAndDropInterface;
    const releasedItemPath = releasedItem.path.split('.').map(i => parseInt(i, 10));
    const hostObjectPath =  computeSchemaPathFromQueryPath(props.query, props.node.treeNodePath, props.schema);

    const newQuery = computeAdditionalNode(releasedItemPath, hostObjectPath.length, props.schema);
    if (newQuery) props.treeNodeOperations.addNode(props.node.treeNodePath, newQuery)
  },
  canDrop(props: ObjectNodeWidgetProps, monitor: DropTargetMonitor) {
    // compute path in schema and compare to the one sent from the grabbed item

    const itemTypeSchemaPath = computeSchemaPathFromQueryPath(props.query, props.node.treeNodePath, props.schema).join('.');
    const canDrop = (monitor.getItem() as DragAndDropInterface).path.startsWith(itemTypeSchemaPath);

    return canDrop;
  }
};

interface DroppedItemProps {
  canDrop?: boolean;
  isOver?: boolean;
  connectDropTarget?: ConnectDropTarget;
  isDragging?: boolean;
}

type Props = ObjectNodeWidgetProps &
  InjectedIntlProps &
  InjectedDrawerProps &
  DroppedItemProps & 
  InjectedThemeColorsProps;

class ObjectNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  constructor(props: Props & InjectedDrawerProps) {
    super(props);
    this.state = {
      focus: false,
      hover: false,
    };
  }

  setPosition = (node: HTMLDivElement | null) => {
    const bodyPosition = document.body.getBoundingClientRect();
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top + bodyPosition.top : 0;
    this.left = viewportOffset ? viewportOffset.left + bodyPosition.left : 0;
  };

  toggleCollapsed = () => {
    this.setState({ focus: false }, () => {
      this.props.treeNodeOperations.updateLayout();
    });
  };

  removeNode = () => {

    this.setState({ focus: false }, () => {
      this.props.treeNodeOperations.deleteNode(this.props.node.treeNodePath);
      this.props.treeNodeOperations.updateLayout();
    });
  };

  editNode = () => {
    const { node, lockGlobalInteraction } = this.props;
    this.setState({ focus: false }, () => {
      lockGlobalInteraction(false);
      this.props.openNextDrawer<ObjectNodeFormProps>(ObjectNodeForm, {
        additionalProps: {
          close: this.props.closeNextDrawer,
          breadCrumbPaths: [{ name: node.objectTypeInfo.name }],
          objectTypes: this.props.objectTypes,
          objectType: node.objectTypeInfo,
          onSubmit: (e: ObjectNodeFormData) => {
            this.props.treeNodeOperations.updateNode(
              node.treeNodePath,
              generateObjectNodeFromFormData(e),
            );
            this.props.closeNextDrawer();
          },
          initialValues: generateFormDataFromObjectNode(node.objectNode),
        },
        size: 'small',
      });
    });
  };

  render() {
    const {
      node,
      intl,
      isOver,
      isDragging,
      canDrop,
      connectDropTarget,
      colors
    } = this.props;

    const isActive = isOver && canDrop;

    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });
    const onFocus = () => {
      this.props.lockGlobalInteraction(!this.state.focus);
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus: !this.state.focus });
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    const frequency = FrequencyConverter.toFrequency(node.objectNode);

    const renderedObjectNode = (
      <div className="field">
        <div className="objectValue">
          <span>{node.objectNode.field}</span>
          {frequency.enabled && (
            <div>
              {intl.formatMessage(frequencyModeMessageMap[frequency.mode])}{' '}
              {frequency.value} times
            </div>
          )}
        </div>
      </div>
    );

    let backgroundColor = node.getColor();
    let borderColor = node.getColor();

    if (canDrop) {
      backgroundColor = colors["mcs-info"];
      borderColor = colors["mcs-info"];
    }

    if (isActive) {
      backgroundColor = colors["mcs-success"];
      borderColor = colors["mcs-success"];
    }

    const opacity = isDragging && !canDrop ? 0.3 : 1;

    return connectDropTarget &&
    connectDropTarget (
      <div
        id={this.id}
        className="object-node"
        onClick={onFocus}
        onMouseEnter={onHover('enter')}
        onMouseLeave={onHover('leave')}
        style={{
          ...node.getSize(),
          borderRadius: 4,
          borderStyle: 'solid',
          fontWeight: 'bold',
          color: '#ffffff',
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          opacity
        }}
      >
        {renderedObjectNode}
        <div
            style={{
              position: 'absolute',
              top: (node.getSize().height + node.getSize().borderWidth / 2) / 2,
              left: 0,
            }}
          >
            <PortWidget name="left" node={this.props.node} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: (node.getSize().width + node.getSize().borderWidth / 2) / 2,
            }}
          >
            <PortWidget name="top" node={this.props.node} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: (node.getSize().height + node.getSize().borderWidth / 2) / 2,
              left: (node.getSize().width - node.getSize().borderWidth / 2),
            }}
          >
            <PortWidget name="right" node={this.props.node} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: (node.getSize().height - node.getSize().borderWidth / 2),
              left: (node.getSize().width + node.getSize().borderWidth / 2) / 2,
            }}
          >
            <PortWidget name="bottom" node={this.props.node} />
          </div>
        {this.state.focus && (
          <RenderInBody>
            <div className="query-builder">
              <div
                onClick={onFocus}
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
                className="object-node no-hover"
                style={{
                  ...node.getSize(),
                  borderRadius: 4,
                  borderStyle: 'solid',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderColor: node.getColor(),
                  backgroundColor: node.getColor(),
                  top: this.top - node.getSize().height * ((1 - zoomRatio) / 2),
                  left:
                    this.left - node.getSize().width * ((1 - zoomRatio) / 2),
                  position: 'absolute',
                  zIndex: 1002,
                  transform: `scale(${zoomRatio})`,
                }}
                onClick={onFocus}
              >
                {renderedObjectNode}
              </span>
              <div
                className="boolean-menu"
                style={{
                  top: this.top,
                  left: this.left + node.getSize().width * zoomRatio,
                  zIndex: 1001,
                }}
              >
                {/* Uncomment when feature is ready */}
                {/* <div onClick={this.toggleCollapsed} className='boolean-menu-item'>Collapse</div> */}
                <div onClick={this.editNode} className="boolean-menu-item">
                  Edit
                </div>
                <div onClick={this.removeNode} className="boolean-menu-item">
                  Remove
                </div>
              </div>
            </div>
          </RenderInBody>
        )}
      </div>
    );
  }
}

export default compose<Props, ObjectNodeWidgetProps>(
  DropTarget(
    () => {
      // TODO Dynamicall generate Field or FIELD || OBJECT if the node can have a related object or not
      return ['field', 'object'];
    },
    addinTarget,
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      isDragging: monitor.getItemType()
    })
  ),
  injectIntl,
  injectDrawer,
  injectThemeColors,
)(ObjectNodeWidget);
