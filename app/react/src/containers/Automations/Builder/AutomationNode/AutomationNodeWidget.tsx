import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import AutomationNodeModel from './AutomationNodeModel';
import { McsIcon, WindowBodyPortal } from '../../../../components';
import { ROOT_NODE_POSITION } from '../../../QueryTool/JSONOTQL/domain';
import {
  injectIntl,
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
} from 'react-intl';
import { injectDrawer } from '../../../../components/Drawer';
import { compose } from 'recompose';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { TreeNodeOperations } from '../domain';

interface AutomationNodeProps {
  node: AutomationNodeModel;
  lockGlobalInteraction: (lock: boolean) => void;
  diagramEngine: DiagramEngine;
  nodeOperations: TreeNodeOperations;
}

interface State {
  focus: boolean;
  hover: boolean;
}

const messages = defineMessages({
  edit: {
    id: 'automation.builder.node.edit',
    defaultMessage: 'Edit',
  },
  remove: {
    id: 'automation.builder.node.remove',
    defaultMessage: 'Remove',
  },
});

type Props = AutomationNodeProps & InjectedDrawerProps & InjectedIntlProps;

class AutomationNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  constructor(props: Props) {
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

  removeNode = () => {
    this.setState({ focus: false }, () => {
      this.props.nodeOperations.deleteNode(
        this.props.node.storylineNodeModel.node.id,
      );
    });
  };

  editNode = () => {
    // const { lockGlobalInteraction } = this.props;
    // this.setState({ focus: false }, () => {
    //   lockGlobalInteraction(false);
    //   this.props.openNextDrawer<>(ObjectNodeForm, {
    //     additionalProps: {
    //       close: this.props.closeNextDrawer,
    //       breadCrumbPaths: [{ name: node.objectTypeInfo.name }],
    //       objectTypes: this.props.objectTypes,
    //       objectType: node.objectTypeInfo,
    //       onSubmit: (e: ObjectNodeFormData) => {
    //         this.props.treeNodeOperations.updateNode(
    //           node.treeNodePath,
    //           generateObjectNodeFromFormData(e),
    //         );
    //         this.props.closeNextDrawer();
    //       },
    //       initialValues: generateFormDataFromObjectNode(node.objectNode),
    //       isTrigger: this.props.isTrigger,
    //     },
    //     size: 'small',
    //   });
    // });
  };

  render() {
    const { node } = this.props;

    const backgroundColor = node.getColor();
    const color = '#ffffff';
    const borderColor = node.getColor();

    const onFocus = () => {
      // this.props.lockGlobalInteraction(!this.state.focus);
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus: !this.state.focus });
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    const renderedAutomationNode = (
      <div
        className="node-body"
        style={{ width: `${node.width}px`, height: `${node.height}px` }}
      >
        <div
          className={'node-icon'}
          style={{
            width: node.getSize().width,
            height: node.getSize().height,
            borderWidth: node.getSize().borderWidth,
            borderColor: borderColor,
            float: 'left',
            color: color,
            backgroundColor: backgroundColor,
          }}
        >
          <McsIcon type={node.iconType} className="available-node-icon-gyph" />
        </div>

        <div className="node-content">{node.title}</div>
      </div>
    );

    return (
      <div id={this.id} onClick={onFocus}>
        {renderedAutomationNode}
        <div
          style={{
            position: 'absolute',
            top: node.height / 2,
            left: node.width / 2,
          }}
        >
          <PortWidget name="center" node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: node.height / 2,
            left: node.width + 20,
          }}
        >
          <PortWidget name="right" node={this.props.node} />
        </div>
        {(node.y !== ROOT_NODE_POSITION.y ||
          node.x !== ROOT_NODE_POSITION.x) && (
          <div
            style={{
              position: 'absolute',
              top: node.height / 2 - 6,
              left: -10,
            }}
          >
            <McsIcon type="chevron-right" className="arrow" />
          </div>
        )}
        {this.state.focus && (
          <WindowBodyPortal>
            <div className="automation-builder">
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
                  width: node.width,
                  height: node.height,
                  borderRadius: 4,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderColor: node.getColor(),
                  top: this.top - node.height * ((1 - zoomRatio) / 2),
                  left: this.left - node.width * ((1 - zoomRatio) / 2),
                  position: 'absolute',
                  zIndex: 1002,
                  transform: `scale(${zoomRatio})`,
                }}
                onClick={onFocus}
              >
                {renderedAutomationNode}
              </span>
              <div
                className="boolean-menu"
                style={{
                  top: this.top,
                  left: this.left + node.width * zoomRatio,
                  zIndex: 1001,
                }}
              >
                {/* Uncomment when feature is ready */}
                {/* <div onClick={this.toggleCollapsed} className='boolean-menu-item'>Collapse</div> */}
                <div onClick={this.editNode} className="boolean-menu-item">
                  <FormattedMessage {...messages.edit} />
                </div>
                <div onClick={this.removeNode} className="boolean-menu-item">
                  <FormattedMessage {...messages.remove} />
                </div>
              </div>
            </div>
          </WindowBodyPortal>
        )}
      </div>
    );
  }
}

export default compose<{}, AutomationNodeProps>(
  injectIntl,
  injectDrawer,
)(AutomationNodeWidget);
