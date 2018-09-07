import * as React from 'react';
import { Tree } from 'antd';
import { SchemaItem, isSchemaItem, isFieldInfoEnfancedResource } from '../domain';
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
            isSchemaItem(item)
          ) {
            return (
              <TreeNode selectable={false} key={item.id} title={<FieldNode id={item.id} item={item} type="object" />}>
                {loop(item, item.schemaType)}
              </TreeNode>
            );
          }
          return isFieldInfoEnfancedResource(item) && <TreeNode selectable={false} key={item.id} title={<FieldNode id={item.id} type="field" schemaType={objectType} item={item} />} />;
        },
      );

    return schema ? (<Tree>{loop(schema)}</Tree>) : null;
  }
}
