import * as React from 'react';
import { Tree } from 'antd';
import { SchemaItem } from './domain';

const TreeNode = Tree.TreeNode;

export interface SchemaVizualizerProps {
  data?: SchemaItem;
}

export default class SchemaVizualizer extends React.Component<
  SchemaVizualizerProps,
  any
> {
  render() {
    const { data } = this.props;

    const loop = (gData: SchemaItem) =>
      gData &&
      gData.fields.map(
        (item): React.ReactNode => {
          if (
            (item as SchemaItem).fields &&
            (item as SchemaItem).fields.length
          ) {
            const itemSchema = item as SchemaItem;
            return (
              <TreeNode key={itemSchema.id} title={itemSchema.name}>
                {loop(itemSchema)}
              </TreeNode>
            );
          }
          return <TreeNode key={item.id} title={item.name} />;
        },
      );

    return data ? <Tree>{loop(data)}</Tree> : null;
  }
}
