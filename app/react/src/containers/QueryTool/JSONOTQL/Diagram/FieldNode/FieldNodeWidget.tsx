import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import FieldNodeModel from './FieldNodeModel';
import FieldNodeComparisonRenderer from './FieldNodeComparisonRenderer';
import { RenderInBody, McsIcon, ButtonStyleless } from '../../../../../components';
import { TreeNodeOperations } from '../../domain';
import FieldNodeFormWrapper from '../../Edit/Sections/Field/FieldNodeFormWrapper';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { FieldNodeFormDataValues, FORM_ID } from '../../Edit/domain';
import { compose } from 'recompose';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';

interface FieldNodeWidgetProps {
  node: FieldNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
  lockGlobalInteraction: (lock: boolean) => void;
  objectTypes: ObjectLikeTypeInfoResource[];
}

interface MapStateToProps {
  formValues: FieldNodeFormDataValues;
}

interface State {
  focus: boolean;
  hover: boolean;
  edit: boolean;
}

const EDIT_FIELD_SIZE = 300;
const ARROW_SIZE = 10;

type Props = FieldNodeWidgetProps & MapStateToProps;

class FieldNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  right: number = 0;
  bottom: number = 0;
  id: string = cuid();
  wrapperId: string = cuid();
  wrapperRef: HTMLDivElement | null = null;
  selectRef: HTMLDivElement | null = null;
  isDragging: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      focus: false,
      hover: false,
      edit: false,
    };
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.setFlag());
    window.addEventListener('mousemove', this.setFlag(true));
    window.addEventListener('mouseup', this.handleClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleClickOutside);
    window.removeEventListener('mousedown', this.setFlag());
    window.removeEventListener('mousemove', this.setFlag(true));
  }

  setWrapperRef = (node: HTMLDivElement | null) => {
    this.wrapperRef = node;
  };

  setSelectRef = (node: HTMLDivElement | null) => {
    this.selectRef = node;
  };

  handleClickOutside = (event: any) => {
    const { formValues, treeNodeOperations, node, lockGlobalInteraction } = this.props;
    if (
      !this.isDragging &&
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.selectRef &&
      !this.selectRef.contains(event.target) &&
      this.state.edit
    ) {
      this.editNode(false);
      treeNodeOperations.updateNode(node.treeNodePath, formValues.fieldNodeForm)
      lockGlobalInteraction(false)
    } else {
      this.isDragging = false;
    }
  };

  setFlag = (isDragging?: boolean) => () => {
    this.isDragging = !!isDragging;
  };

  setPosition = (node: HTMLDivElement | null) => {
    const bodyPosition = document.body.getBoundingClientRect();
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top + bodyPosition.top : 0;
    this.left = viewportOffset ? viewportOffset.left + bodyPosition.left : 0;
    this.right = viewportOffset ? bodyPosition.right - viewportOffset.right : 0;
    this.bottom = viewportOffset
      ? bodyPosition.bottom - viewportOffset.bottom
      : 0;
  };

  removeNode = () => {
    const { lockGlobalInteraction } = this.props;
    this.setState({ focus: false }, () => {
      this.props.treeNodeOperations.deleteNode(this.props.node.treeNodePath);
      lockGlobalInteraction(false);
    });
  };

  editNode = (edition: boolean) => {
    const { lockGlobalInteraction } = this.props;
    this.setState(
      {
        edit: edition,
      },
      () => {
        this.props.node.extras.edition = edition;
        lockGlobalInteraction(false);
      },
    );
  };

  render() {
    const { node, treeNodeOperations } = this.props;

    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });
    const onFocus = () => {
      this.props.lockGlobalInteraction(!this.state.focus);
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus: !this.state.focus });
    };

    const onSubmit = (val: FieldNodeFormDataValues) => {
      treeNodeOperations.updateNode(node.treeNodePath, val.fieldNodeForm);
      this.editNode(false);
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    const triggerEdit = () => this.editNode(true);
    const closeEdit = () => this.editNode(false);

    const renderEditNode = () => {
      return (
        <div
          id={this.id}
          style={{
            backgroundColor: '#ffffff',
            borderStyle: 'solid',
            color: node.getColor(),
            borderColor: node.getColor(),
            zIndex: 999999,
            padding: 10,
            borderRadius: 4,
            width: EDIT_FIELD_SIZE,
          }}
          className="mcs-form-container no-padding"
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${ARROW_SIZE}px solid transparent`,
              borderRight: `${ARROW_SIZE}px solid transparent`,
              borderBottom: `${ARROW_SIZE}px solid ${node.getColor()}`,
              transform: 'rotate(-90deg)',
              position: 'absolute',
              left: -ARROW_SIZE - (ARROW_SIZE / 2) + 2,
              top: (node.getSize().height / 2) - (ARROW_SIZE / 2)
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 7,
              right: 0
            }}
          >
            <ButtonStyleless onClick={closeEdit}><McsIcon type="close" /></ButtonStyleless>
          </div>
          <FieldNodeFormWrapper
            breadCrumbPaths={[]}
            objectType={node.objectTypeInfo}
            objectTypes={this.props.objectTypes}
            initialValues={{ fieldNodeForm: node.fieldNode }}
            onSubmit={onSubmit}
            idToAttachDropDowns={this.wrapperId}
          />
          <RenderInBody>
            <div ref={this.setSelectRef} id={this.wrapperId} />
          </RenderInBody>
        </div>
      );
    };

    

    const renderedStandardNode = (): JSX.Element => {
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
          }}
          onMouseEnter={onHover('enter')}
          onMouseLeave={onHover('leave')}
        >
          <div className="field">
            <FieldNodeComparisonRenderer node={node} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: (node.getSize().height - node.getSize().borderWidth / 2) / 2,
              left: 0,
            }}
          >
            <PortWidget name="center" node={this.props.node} />
          </div>
          {this.state.focus && (
            <RenderInBody>
              <div className="query-builder full-screen">
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
                    backgroundColor: '#ffffff',
                    borderStyle: 'solid',
                    color: node.getColor(),
                    borderColor: node.getColor(),
                    top:
                      this.top - node.getSize().height * ((1 - zoomRatio) / 2),
                    left:
                      this.left - node.getSize().width * ((1 - zoomRatio) / 2),

                    position: 'absolute',
                    zIndex: 1002,
                    transform: `scale(${zoomRatio})`,
                  }}
                  onClick={onFocus}
                >
                  <div className="field">
                    <FieldNodeComparisonRenderer node={node} />
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
                  <div onClick={triggerEdit} className="boolean-menu-item">
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
    };

    const renderedFieldNode = (
      <div ref={this.setWrapperRef}>
        {this.state.edit ? renderEditNode() : renderedStandardNode()}
      </div>
    );

    return renderedFieldNode;
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});
 

export default compose<Props, FieldNodeWidgetProps>(
  connect(mapStateToProps)
)(FieldNodeWidget)