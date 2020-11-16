
import * as React from 'react';
import {
  DragSource,
  ConnectDragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';
import { DragAndDropInterface, SchemaItem, extractFieldType, FieldInfoEnhancedResource } from '../domain';
import { Tooltip } from 'antd';
import cuid from 'cuid';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

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
    let itemName = item.name;
    if (item.decorator && item.decorator.hidden === false) {
      itemName = item.decorator.label
    }

    const Fieldtype = type === 'object' ? (item as SchemaItem).schemaType : (item as FieldInfoEnhancedResource).field_type;
    let helper = (<span className="field-type">{Fieldtype} <McsIcon type="dots" /></span>);

    if (item.decorator && item.decorator.hidden === false && item.decorator.help_text) {
      const helptext = `${item.decorator.help_text} - ${Fieldtype}`;
      const id = cuid();
      const getPopupContainer = () => document.getElementById(id)!
      helper = (<span className="field-type" id={id}><Tooltip placement="left" title={helptext} getPopupContainer={getPopupContainer}><McsIcon type="question" /></Tooltip></span>);
    }


    return connectDragSource &&
    connectDragSource(
      <div className={`field-node-item ${isDragging ? 'dragging' : ''}`}>
        <div>{itemName} {helper}</div>
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
