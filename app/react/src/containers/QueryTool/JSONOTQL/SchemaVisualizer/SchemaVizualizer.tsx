import * as React from 'react';
import { Tree } from 'antd';
import {
  SchemaItem,
  isSchemaItem,
  FieldInfoEnhancedResource,
} from '../domain';
import FieldNode from './FieldNode';
import FieldStandardNode from './FieldStandardNode';
import { DataNode } from 'antd/lib/tree';
import cuid from 'cuid';

export interface SchemaVizualizerProps {
  schema?: SchemaItem;
  disableDragAndDrop?: boolean;
}


export default class SchemaVizualizer extends React.Component<
  SchemaVizualizerProps,
  any
> {

  // To avoid Tree loosing its state of expanded/collapsed nodes
  // we disable component update.
  // Since schema or disableDragAndDrop props should not change when this component
  // is first mounted, I believe it is safe to disable component update.
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { schema, disableDragAndDrop } = this.props;
    const loop = (gData: SchemaItem, objectType?: string) =>
      gData &&
      gData.fields.map(
        (item): DataNode => {
          if (isSchemaItem(item)) {
            return {
              title: disableDragAndDrop ? (
                <FieldStandardNode id={item.id} item={item} type="object" />
              ) : (
                <FieldNode id={item.id} item={item} type="object" />
              ),
              key: cuid(),
              selectable: false,
              children: loop(item, item.schemaType),
            };
          }
          
          return (
            {
              title:disableDragAndDrop ? (
                <FieldStandardNode
                  id={item.id}
                  type="field"
                  schemaType={objectType}
                  item={item as FieldInfoEnhancedResource}
                />
              ) : (
                <FieldNode
                  id={item.id}
                  type="field"
                  schemaType={objectType}
                  item={item as FieldInfoEnhancedResource}
                />
              ),
              key: cuid(),
              selectable: false
            }
          );
        },
      );
    return schema ? <Tree treeData={loop(schema)} /> : null;
  }
}
