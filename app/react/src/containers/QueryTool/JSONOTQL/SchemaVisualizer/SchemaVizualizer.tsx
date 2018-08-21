import * as React from 'react';
import { Tree } from 'antd';
import { SchemaItem } from '../domain';
import FieldNode from './FieldNode';

const TreeNode = Tree.TreeNode;

export interface SchemaVizualizerProps {
  schema?: SchemaItem;
}

export default class SchemaVizualizer extends React.Component<
  SchemaVizualizerProps,
  any
> {
  render() {
    const { schema } = this.props;
    const loop = (gData: SchemaItem, objectType?: string) =>
      gData &&
      gData.fields.map(
        (item): React.ReactNode => {
          if (
            (item as SchemaItem).fields &&
            (item as SchemaItem).fields.length
          ) {
            const itemSchema = item as SchemaItem;
            return (
              <TreeNode selectable={false} key={itemSchema.id} title={<FieldNode id={itemSchema.id} item={itemSchema} type="object" />}>
                {loop(itemSchema, itemSchema.schemaType)}
              </TreeNode>
            );
          }
          return <TreeNode selectable={false} key={item.id} title={<FieldNode id={item.id} type="field" schemaType={objectType} item={item as SchemaItem} />} />;
        },
      );

    return schema ? (<Tree>{loop(schema)}</Tree>) : null;
  }
}
