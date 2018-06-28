import * as React from 'react';
import {
  DragSource,
  ConnectDragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';
import { DragAndDropInterface, SchemaItem, extractFieldType } from '../domain';
import { McsIcon } from '../../../../components';

export interface FieldNodeProps {
  id: string;
  item: SchemaItem;
  type: 'object' | 'field';
  connectDragSource?: ConnectDragSource
  isDragging?: boolean;
  isDropped?: boolean;
  schemaType?: string;
}

const fieldSource = {
	beginDrag(props: FieldNodeProps) {
    const draggedObject: DragAndDropInterface = {
      name: props.item.name,
      objectSource: props.item.closestParentType!,
      schemaType: props.schemaType,
      type: props.type,
      path: props.item.path!,
      item: props.item,
      fieldType: props.type === 'field' ? extractFieldType(props.item as any) : undefined
    }
		return draggedObject
	},
}

class FieldNode extends React.Component<FieldNodeProps, any> {
  render() {
    const { item, isDragging, connectDragSource } = this.props;
    return connectDragSource &&
    connectDragSource(
      <div className={`field-node-item ${isDragging ? 'dragging' : ''}`}>
        <div>{item.name} <span className="field-type">{item.schemaType ? item.schemaType : (item as any).field_type} <McsIcon type="dots" /></span></div>
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
