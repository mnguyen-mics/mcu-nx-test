import * as React from 'react';
import TreeSelect, { TreeData } from './TreeSelect';
import generateGuid from '../utils/generateGuid';

interface SearchAndTreeSelectProps {
  onChange: (checkedIds: string[]) => void;
  placeholder?: string;
  treeData: TreeData[];
  checkedIds: string[];
}

function documentGetElementById(id: string) {
  return () => document.getElementById(id) as HTMLElement;
}

export { TreeData };

export default class SearchAndTreeSelect extends React.Component<SearchAndTreeSelectProps> {

  containerId = generateGuid();

  render() {

    const {
      checkedIds,
      ...rest,
    } = this.props;

    return (
      <div id={this.containerId}>
        <TreeSelect
          {...rest}
          getPopupContainer={documentGetElementById(this.containerId)}
          value={checkedIds}
          treeCheckable={true}
          hideSelected={true}
          dropdownStyle={{ maxHeight: '200px', overflowY: 'auto' }}
        />
      </div>
    );
  }
}
