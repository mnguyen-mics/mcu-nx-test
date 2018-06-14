import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import FieldNodeModel from './FieldNodeModel';
import FieldNodeComparisonRenderer from './FieldNodeComparisonRenderer';
import { McsIcon, ButtonStyleless, RenderInBody } from '../../../../../components';
import { TreeNodeOperations } from '../../domain';

const RenderInBodyAny = RenderInBody as any;

interface Props {
  node: FieldNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  lockGlobalInteraction: (lock: boolean) => void
}

interface State {
  focus: boolean;
  hover: boolean;
}

export default class FieldNodeWidget extends React.Component<Props, State> {
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
    const {
      lockGlobalInteraction
    } = this.props;
    this.setState({ focus: false }, () => {
      this.props.treeNodeOperations.deleteNode(this.props.node.treeNodePath);
      lockGlobalInteraction(false)
    });
    
  };

  render() {
    const { node } = this.props;

    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });
    const onFocus = () => {
      this.props.lockGlobalInteraction(!this.state.focus)
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus: !this.state.focus });
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    const renderedFieldNode = (
      <div className="field">
        <div className="buttons">
          <ButtonStyleless onClick={this.removeNode}>
            <McsIcon type="close" />
          </ButtonStyleless>
        </div>
        <FieldNodeComparisonRenderer node={node} />
      </div>
    );

    return (
      <div
        id={this.id}
        className="field-node"
        onClick={onFocus}
        
        style={{
          ...node.getSize(),
          backgroundColor: '#ffffff',
          borderStyle: 'solid',
          color: node.getColor(),
          borderColor: node.getColor(),
          boxShadow:
            this.state.hover && !this.state.focus
              ? '0 3px 6px rgba(0, 0, 0, 0.4)'
              : 'none',
        }}
        onMouseEnter={onHover('enter')}
        onMouseLeave={onHover('leave')}
      >
        {renderedFieldNode}
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
                className="object-node"
                style={{
                  ...node.getSize(),
                  backgroundColor: '#ffffff',
                  borderStyle: 'solid',
                  color: node.getColor(),
                  borderColor: node.getColor(),
                  top: this.top - node.getSize().height * ((1 - zoomRatio) / 2),
                  left:
                    this.left - node.getSize().width * ((1 - zoomRatio) / 2),
                  position: 'absolute',
                  zIndex: 1002,
                  transform: `scale(${zoomRatio})`,
                }}
                onClick={onFocus}
              >
                {renderedFieldNode}
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
