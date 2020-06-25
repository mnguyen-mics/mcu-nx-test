import * as React from 'react';
import { TreeSelect } from 'antd';
import { TreeNode } from 'antd/lib/tree-select';

export interface TreeDataParent {
  value: string;
  title: string;
  childrenFilterName?: string;
  children?: TreeDataChildren[];
}

export interface TreeDataChildren {
  value: string;
  title: string;
}

interface Filters {
  [filterName: string]: string[];
}

export interface TreeSelectFilterProps {
  className?: string;
  placeholder: string;
  tree: TreeDataParent[];
  parentFilterName: string;
  maxTagCount?: number;
  selectedItems?: string[];
  handleItemClick: (filters: Filters) => void;
  style?: React.CSSProperties;
}

class TreeSelectFilter extends React.Component<TreeSelectFilterProps, {}> {

  onTreeSelectChange = (value: string[]) => {
    const { tree, parentFilterName, handleItemClick } = this.props;
    const parentFilter = {
      filterName: parentFilterName,
      values: tree.filter(parent => value.findIndex(v => v === parent.value) >= 0).map(parent => parent.value),
    }
    const childrenFilter = tree.map(parent => {
      return {
        filterName: parent.childrenFilterName,
        values: parent.children 
          ? parent.children
            .filter(children => value.findIndex(v => v === `${parent.value}_${children.value}`) >= 0)
            .map(children => children.value) 
          : [],
      }
    })
    .reduce((acc: Array<{ filterName: string, values: string[] }>, val) => {
      if(val.filterName !== undefined && val.values !== undefined && val.values.length > 0) 
        return acc.concat({
          filterName: val.filterName,
          values: val.values,
        })
      return acc;
    }, []);

    const filters: Filters = {};
    filters[parentFilter.filterName] = parentFilter.values;
    childrenFilter.map(filter => {
      filters[filter.filterName] = filter.values
    })
    handleItemClick(filters);
  }

  render() {
    const { 
      className, 
      tree, 
      placeholder, 
      style, 
      maxTagCount, 
      selectedItems 
    } = this.props;

    const treeData:  TreeNode[] = tree.map(parent => {
      return {
        value: parent.value,
        title: parent.title,
        key: parent.value,
        children: parent.children && parent.children.map(children => {
          return {
            value: `${parent.value}_${children.value}`,
            title: children.title,
            key: `${parent.value}_${children.value}`,
          }
        })
      };
    });

    return (
      <TreeSelect
        className={className}
        treeData={treeData}
        treeCheckable={true}
        placeholder={placeholder}
        showCheckedStrategy='SHOW_PARENT'
        showSearch={false}
        maxTagCount={maxTagCount}
        onChange={this.onTreeSelectChange}
        style={style}
        value={selectedItems}
        allowClear={true}
      />
    );
  }
}

export default TreeSelectFilter;
