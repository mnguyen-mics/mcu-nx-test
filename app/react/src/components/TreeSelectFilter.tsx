import * as React from 'react';
import { TreeSelect } from 'antd';
import { TreeNode } from 'antd/lib/tree-select';
import cuid from 'cuid';

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

interface State {
  didMount: boolean;
}

class TreeSelectFilter extends React.Component<TreeSelectFilterProps, State> {
  id: string = cuid();

  constructor(props: TreeSelectFilterProps) {
    super(props);
    this.state = { didMount: false };
  }

  componentDidMount() {
    this.setState({
      didMount: true,
    });
  }

  onTreeSelectChange = (value: string[]) => {
    const { tree, parentFilterName, handleItemClick } = this.props;
    const parentFilter = {
      filterName: parentFilterName,
      values: tree
        .filter(parent => value.some(v => v === parent.value))
        .map(parent => parent.value),
    };
    const childrenFilters = tree
      .map(parent => {
        return {
          filterName: parent.childrenFilterName,
          values: parent.children
            ? parent.children
                .filter(children =>
                  value.some(v => v === `${parent.value}_${children.value}`),
                )
                .map(children => children.value)
            : [],
        };
      })
      .reduce((acc: Array<{ filterName: string; values: string[] }>, val) => {
        if (
          val.filterName !== undefined &&
          val.values !== undefined &&
          val.values.length > 0
        )
          return acc.concat({
            filterName: val.filterName,
            values: val.values,
          });
        return acc;
      }, []);

    // We want to push parent filter if we have one of its children
    childrenFilters.forEach(childrenFilter => {
      const parent = tree.find(
        p => p.childrenFilterName === childrenFilter.filterName,
      );

      if (parent && !parentFilter.values.some(f => f === parent.value))
        parentFilter.values.push(parent.value);
    });

    const filters: Filters = {};
    tree.forEach(parent => {
      if (parent.childrenFilterName) filters[parent.childrenFilterName] = [];
    });
    filters[parentFilter.filterName] = parentFilter.values;
    childrenFilters.forEach(filter => {
      filters[filter.filterName] = filter.values;
    });

    handleItemClick(filters);
  };

  render() {
    const {
      className,
      tree,
      placeholder,
      style,
      maxTagCount,
      selectedItems,
    } = this.props;

    const { didMount } = this.state;

    // We prefix children value with parent value, as value must be unique in all tree
    const treeData: TreeNode[] = tree.map(parent => {
      return {
        value: parent.value,
        title: parent.title,
        key: parent.value,
        children:
          parent.children &&
          parent.children.map(children => {
            return {
              value: `${parent.value}_${children.value}`,
              title: children.title,
              key: `${parent.value}_${children.value}`,
            };
          }),
      };
    });

    // If not all children of a parent are selected we remove the parent from selected items
    const filteredSelectedItems: string[] | undefined = selectedItems;
    if (filteredSelectedItems) {
      filteredSelectedItems.forEach(item => {
        const parent = tree.find(p => p.value === item);

        if (parent && parent.children) {
          const children = parent.children.map(
            c => `${parent.value}_${c.value}`,
          );
          let childrensSelected = 0;
          children.forEach(c => {
            if (filteredSelectedItems.includes(c)) childrensSelected++;
          });
          if (childrensSelected !== 0 && childrensSelected !== children.length)
            filteredSelectedItems.splice(
              filteredSelectedItems.indexOf(parent.value),
              1,
            );
        }
      });
    }

    const getRef = () => document.getElementById(this.id)!;

    return (
      <span id={this.id} className="mcs-treeSelectFilter">
        {didMount && (
          <TreeSelect
            className={className}
            treeData={treeData}
            treeCheckable={true}
            placeholder={placeholder}
            showCheckedStrategy="SHOW_PARENT"
            showSearch={false}
            maxTagCount={maxTagCount}
            onChange={this.onTreeSelectChange}
            style={style}
            value={filteredSelectedItems}
            allowClear={true}
            getPopupContainer={getRef}
          />
        )}
      </span>
    );
  }
}

export default TreeSelectFilter;
