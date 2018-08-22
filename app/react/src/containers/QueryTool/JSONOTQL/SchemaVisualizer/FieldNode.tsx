import * as React from 'react';
import {
  DragSource,
  ConnectDragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';
import { DragAndDropInterface, SchemaItem, extractFieldType, FieldInfoEnhancedResource } from '../domain';
import { McsIcon } from '../../../../components';

export type FieldNodeProps = FieldNodeObjectProps | FieldNodeFieldProps;


interface FieldNodeObjectProps extends FieldNodeCommonProps {
  type: 'object';
  item: SchemaItem;
}

interface FieldNodeFieldProps extends FieldNodeCommonProps {
  type: 'field';
  item: FieldInfoEnhancedResource;
}

interface FieldNodeCommonProps {
  id: string;
  connectDragSource?: ConnectDragSource
  isDragging?: boolean;
  isDropped?: boolean;
  schemaType?: string;
}


const fieldSource = {
	beginDrag(props: FieldNodeProps) {
    let draggedObject: DragAndDropInterface;
    if (props.type === 'field') {
      draggedObject = {
        name: props.item.name,
        objectSource: props.item.closestParentType!,
        type: props.type,
        path: props.item.path!,
        item: props.item,
        fieldType: extractFieldType(props.item)
      }
    } else {
      draggedObject = {
        name: props.item.name,
        objectSource: props.item.closestParentType!,
        schemaType: props.schemaType!,
        type: props.type,
        path: props.item.path!,
        item: props.item,
      }
    }
		return draggedObject
	},
}

class FieldNode extends React.Component<FieldNodeProps, any> {
  render() {
    const { item, isDragging, connectDragSource, type } = this.props;
    return connectDragSource &&
    connectDragSource(
      <div className={`field-node-item ${isDragging ? 'dragging' : ''}`}>
        <div>{item.name} <span className="field-type">{type === 'object' ? (item as SchemaItem).schemaType : (item as FieldInfoEnhancedResource).field_type} <McsIcon type="dots" /></span></div>
      </div>,
    );
  }
}

export default DragSource(
  (props: FieldNodeProps) => props.type,
  fieldSource,
  (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging(),
	}),
)(FieldNode);
