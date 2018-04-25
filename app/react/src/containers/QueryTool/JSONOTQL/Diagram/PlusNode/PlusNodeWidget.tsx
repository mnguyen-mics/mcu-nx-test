import * as React from 'react';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import { compose } from 'recompose';
import PlusNodeModel from './PlusNodeModel';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { TreeNodeOperations } from '../../domain';
import { McsIcon, RenderInBody } from '../../../../../components';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import ObjectNodeForm, { ObjectNodeFormProps } from '../../Edit/ObjectNodeForm';
import {
  ObjectNodeFormData,
  generateObjectNodeFromFormData,
  QUERY_DOCUMENT_INITIAL_VALUE,
} from '../../Edit/domain';

interface Props {
  node: PlusNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
}

interface State {
  focus: boolean;
  hover: boolean;
}

class PlusNodeWidget extends React.Component<Props & InjectedDrawerProps, State> {
  top: number = 0;
  left: number = 0;

  constructor(props: Props & InjectedDrawerProps) {
    super(props);
    this.state = { focus: false, hover: false };
  }

  addObjectNode = () => {
    const { node } = this.props;
    this.setState({ focus: false }, () => {
      // let computedSchemaPath = ['UserPoint'];
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
        },
        size: 'small',
      });
    });
  };

  addGroup = () => {
    const { treeNodeOperations, node } = this.props;
    if (node.root) {
      treeNodeOperations.addNewGroupAsRoot();
    } else {
      treeNodeOperations.addNode(node.treeNodePath, {
        type: 'GROUP',
        boolean_operator: 'OR',
        expressions: [],
      });
    }
  };

  setPosition = (node: HTMLDivElement | null) => {
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top : 0;
    this.left = viewportOffset ? viewportOffset.left : 0;
  };

  render() {
    const { node } = this.props;

    const handleClickOnPlus = () => {
      this.setState({ focus: !this.state.focus });
    };

    const onHover = (type: 'enter' | 'leave') => () => {
      this.setState({ hover: type === 'enter' ? true : false });
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    return (
      <div className="plus-node noFocus" ref={ref => this.setPosition(ref)}>
        <div
          style={{
            width: node.getSize().width,
            height: node.getSize().height,
            borderWidth: node.getSize().borderWidth,
            borderColor: node.getColor(),
            float: 'left',
            color: this.state.hover ? '#ffffff' : node.getColor(),
            backgroundColor: this.state.hover ? node.getColor() : '#ffffff',
          }}
          onClick={handleClickOnPlus}
          onMouseEnter={onHover('enter')}
          onMouseLeave={onHover('leave')}
          className={`plus-button ${this.state.focus ? 'plus-clicked' : ''}`}
        >
          <McsIcon type="plus" />
        </div>

        <div
          style={{
            position: 'absolute',
            top: (node.getSize().height + node.getSize().borderWidth / 2) / 2,
            left: (node.getSize().width + node.getSize().borderWidth / 2) / 2,
          }}
        >
          <PortWidget name="center" node={this.props.node} />
        </div>

        {this.state.focus && (
          <RenderInBody>
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
                  top: this.top - node.getSize().height * ((1 - zoomRatio) / 2),
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
                    Object
                  </div>
                )}
                {(node.root ||
                  (node.objectOrGroupNode &&
                    node.objectOrGroupNode.type === 'GROUP')) && (
                  <div onClick={this.addGroup} className="boolean-menu-item">
                    Group
                  </div>
                )}
              </div>
            </div>
          </RenderInBody>
        )}
      </div>
    );
  }
}

export default compose<Props & InjectedDrawerProps, Props>(injectDrawer)(
  PlusNodeWidget,
);
