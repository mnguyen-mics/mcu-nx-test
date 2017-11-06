import TreeNode from './TreeNode';
import { SHOW_ALL, SHOW_PARENT, SHOW_CHILD } from './strategies';

import React from 'react';
import Select from './Select';
import classNames from 'classnames';
import { AbstractSelectProps } from 'antd/lib/select';
import injectLocale from 'antd/lib/locale-provider/injectLocale';

const RcTreeSelect = Select as any;

export interface TreeData {
  key?: string;
  value: string;
  label: string;
  parentLabel?: string;
  className?: string;
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf: boolean;
  children?: TreeData[];
}

export interface TreeSelectProps extends AbstractSelectProps {
  value?: string | any[];
  defaultValue?: string | any[];
  multiple?: boolean;
  onSelect?: (value: any) => void;
  onChange?: (value: any, label: any) => void;
  onSearch?: (value: any) => void;
  searchPlaceholder?: string;
  dropdownStyle?: React.CSSProperties;
  dropdownMatchSelectWidth?: boolean;
  treeDefaultExpandAll?: boolean;
  treeCheckable?: boolean | React.ReactNode;
  treeDefaultExpandedKeys?: string[];
  filterTreeNode?: (inputValue: string, treeNode: TreeData) => boolean | boolean;
  treeNodeFilterProp?: string;
  treeNodeLabelProp?: string;
  treeData?: TreeData[];
  treeDataSimpleMode?: boolean | object;
  loadData?: (node: any) => void;
  showCheckedStrategy?: 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
  labelInValue?: boolean;
  treeCheckStrictly?: boolean;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  hideSelected?: boolean;
  allowClear?: boolean;
  showArrow?: boolean;
  placeholder?: string;
}

abstract class TreeSelect extends React.Component<TreeSelectProps, any> {
  static TreeNode = TreeNode;
  static SHOW_ALL = SHOW_ALL;
  static SHOW_PARENT = SHOW_PARENT;
  static SHOW_CHILD = SHOW_CHILD;

  static defaultProps = {
    prefixCls: 'ant-select',
    transitionName: 'slide-up',
    choiceTransitionName: 'zoom',
    showSearch: false,
    dropdownClassName: 'ant-select-tree-dropdown',
  };

  constructor(props: TreeSelectProps) {
    super(props);

    // tslint:disable-next-line
    // console.log( 
    //   props.multiple !== false || !props.treeCheckable,
    //   '`multiple` will always be `true` when `treeCheckable` is true',
    // );
  }

  abstract getLocale(): any;

  render() {
    const locale = this.getLocale();
    const {
      prefixCls,
      className,
      size,
      notFoundContent = locale.notFoundContent,
      dropdownStyle,
      ...restProps,
    } = this.props;

    const cls = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    }, className);

    let checkable = restProps.treeCheckable;
    if (checkable) {
      checkable = <span className={`${prefixCls}-tree-checkbox-inner`} />;
    }

    return (
      <RcTreeSelect
        {...restProps}
        prefixCls={prefixCls}
        className={cls}
        dropdownStyle={{ maxHeight: '100vh', overflow: 'auto', ...dropdownStyle }}
        treeCheckable={checkable}
        notFoundContent={notFoundContent}
      />
    );
  }
}

// Use Select's locale
const injectSelectLocale = injectLocale('Select', {});
export default injectSelectLocale<TreeSelectProps>(TreeSelect as any);
export { TreeNode };
