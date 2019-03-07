import * as React from 'react';
import { TreeData } from './TreeSelect';
import { TreeSelect } from './PopupContainers';

export interface SearchAndTreeSelectProps {
  onChange: (checkedIds: string[]) => void;
  placeholder?: string;
  treeData: TreeData[];
  checkedIds: string[];
  disabled?: boolean;
}

export { TreeData };

export default class SearchAndTreeSelect extends React.Component<
  SearchAndTreeSelectProps
> {
  render() {
    const { checkedIds, ...rest } = this.props;

    return (
      <TreeSelect
        {...rest}
        value={checkedIds}
        treeCheckable={true}
        hideSelected={true}
        dropdownStyle={{ maxHeight: '200px', overflowY: 'auto' }}
      />
    );
  }
}
