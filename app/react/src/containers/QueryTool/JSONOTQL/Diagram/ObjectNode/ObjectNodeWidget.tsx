import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import { compose } from 'recompose';
import ObjectNodeModel from './ObjectNodeModel';
import { RenderInBody } from '../../../../../components';
import { TreeNodeOperations } from '../../domain';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import ObjectNodeForm, { ObjectNodeFormProps } from '../../Edit/ObjectNodeForm';
import {
  ObjectNodeFormData,
  generateObjectNodeFromFormData,
  generateFormDataFromObjectNode,
} from '../../Edit/domain';

interface Props {
  node: ObjectNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
}

interface State {
  focus: boolean;
  hover: boolean;
}

const RenderInBodyAny = RenderInBody as any;

class ObjectNodeWidget extends React.Component<
  Props & InjectDrawerProps,
  State
> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  constructor(props: Props & InjectDrawerProps) {
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
    });
  };

  editNode = () => {
    const { node } = this.props;
    let computedSchemaPath = ['UserPoint'];
    if (node.parentObjectNode) {
      computedSchemaPath = [node.parentObjectNode.field];
    }
    this.setState({ focus: false }, () => {
      this.props.openNextDrawer<ObjectNodeFormProps>(ObjectNodeForm, {
        additionalProps: {
          close: this.props.closeNextDrawer,
          breadCrumbPaths: [{ name: 'test' }],
          objectTypes: this.props.objectTypes,
          schemaPath: computedSchemaPath,
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
    const { node } = this.props;

    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });
    const onFocus = (focus: boolean) => () => {
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus });
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    return (
      <div
        id={this.id}
        className="object-node"
        onClick={onFocus(true)}
        onMouseEnter={onHover('enter')}
        onMouseLeave={onHover('leave')}
        style={{
          ...node.getSize(),
          borderRadius: 4,
          borderStyle: 'solid',
          fontWeight: 'bold',
          color: '#ffffff',
          borderColor: node.getColor(),
          backgroundColor: node.getColor(),
          boxShadow:
            this.state.hover && !this.state.focus
              ? '0 3px 6px rgba(0, 0, 0, 0.4)'
              : 'none',
        }}
      >
        <div className="field">
          <div className="objectValue">{node.objectNode.field}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: (node.getSize().height - node.getSize().borderWidth / 2) / 2,
            left: (node.getSize().width - node.getSize().borderWidth / 2) / 2,
          }}
        >
          <PortWidget name="center" node={this.props.node} />
        </div>
        {this.state.focus && (
          <RenderInBodyAny>
            <div className="query-builder">
              <div
                onClick={onFocus(false)}
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
                className="object-node"
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
                onClick={onFocus(false)}
              >
                <div className="field">
                  <div className="objectValue" title={node.objectNode.field}>
                    {node.objectNode.field}
                  </div>
                </div>
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
          </RenderInBodyAny>
        )}
      </div>
    );
  }
}

export default compose<Props & InjectDrawerProps, Props>(injectDrawer)(
  ObjectNodeWidget,
);
