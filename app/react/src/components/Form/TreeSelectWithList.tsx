import * as React from 'react';
import { TreeSelect, Col, Spin } from 'antd';
import { groupBy } from 'lodash';
import { TreeNode } from 'antd/lib/tree-select';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { TooltipProps } from 'antd/lib/tooltip';
import cuid from 'cuid';

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
  ancestors?: TreeData[];
  type?: string;
}

export interface TreeSelectWithListProps {
  label: string;
  placeholder?: string;
  dataSource: TreeData[];
  loading?: boolean;
  tooltipProps: TooltipProps;
  value: string[];
  handleClickOnRemove: (key: string) => void;
  handleOnChange: (checkedKeys: string[]) => void;
  small?: boolean;
  disabled?: boolean;
}

type Props = TreeSelectWithListProps & FormFieldWrapperProps;

interface State {
  treeLeavesCache: {
    [treeValue: string]: { treeData: TreeData; ancestors: TreeData[] };
  };
}

class TreeSelectWithList extends React.Component<Props, State> {
  id: string = cuid();

  constructor(props: Props) {
    super(props);
    this.state = {
      treeLeavesCache: {},
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    this.initTreeLeaves(dataSource);
  }

  componentDidUpdate(previousProps: Props) {
    const { dataSource: previousDataSource } = previousProps;
    const { dataSource } = this.props;

    if (dataSource.length !== previousDataSource.length) {
      // we don't expect the tree to be modified deeply, hence the comparison
      this.initTreeLeaves(dataSource);
    }
  }

  initTreeLeaves = (treeData: TreeData[]) => {
    const treeLeavesCache: {
      [treeValue: string]: { treeData: TreeData; ancestors: TreeData[] };
    } = {};
    const traverse = (tree: TreeData[], ancestors: TreeData[] = []) => {
      tree.forEach(node => {
        if (node.children && node.children.length) {
          traverse(node.children, ancestors.concat([node]));
        }

        treeLeavesCache[node.value] = { treeData: node, ancestors };
      });
    };
    traverse(treeData);
    this.setState({ treeLeavesCache: treeLeavesCache });
  };

  getTreeData = (): TreeNode[] => {
    const { dataSource } = this.props;

    const getTreeDataBase = (treeData: TreeData): TreeNode => {
      return {
        value: treeData.value,
        key: treeData.value,
        title: treeData.label,
        children: treeData.children
          ? treeData.children.map(getTreeDataBase)
          : undefined,
        disabled: treeData.disabled,
        disableCheckBox: treeData.disableCheckbox,
      };
    };

    return dataSource.map(getTreeDataBase);
  };

  render() {
    const {
      value,
      handleClickOnRemove,
      handleOnChange,
      label,
      tooltipProps,
      small,
      loading,
      disabled,
      placeholder,
    } = this.props;

    const { treeLeavesCache } = this.state;

    const treeData = this.getTreeData();

    const selectedLeaves: Array<{
      key: string;
      label: string;
      category: string;
    }> = [];

    Object.keys(treeLeavesCache).forEach(key => {
      if (value.includes(key)) {
        const treeLeave = treeLeavesCache[key];
        selectedLeaves.push({
          key,
          label: treeLeave.treeData.label,
          category: treeLeave.ancestors.reduce(
            (acc, t) => `${acc ? `${acc} > ` : ''}${t.label}`,
            '',
          ),
        });
      }
    });

    const groupedByCategories = groupBy(selectedLeaves, 'category');

    const selectedItemsView: JSX.Element[] = [];
    Object.keys(groupedByCategories).forEach(category => {
      selectedItemsView.push(
        <div key={category} className="audience-service-item as-category">
          {category}
        </div>,
      );

      const leaves = groupedByCategories[category];

      leaves.forEach(leave => {
        const handleClick = () => {
          handleClickOnRemove(leave.key);
        };

        selectedItemsView.push(
          <div key={leave.key} className="audience-service-subitem">
            {leave.label}
            <Button
              disabled={disabled}
              className="remove-button"
              onClick={handleClick}
            >
              <McsIcon type="close" />
            </Button>
          </div>,
        );
      });
    });

    const getRef = () => document.getElementById(this.id)!;

    const flexAlign = value.length > 0 ? 'top' : 'middle';
    return (
      <FormFieldWrapper
        label={label}
        rowProps={{ align: flexAlign }}
        helpToolTipProps={tooltipProps}
        small={small}
        className="mcs-treeSelectWithList"
      >
        <Col span={24}>
          <div
            className={
              value.length || loading
                ? 'selected-audience-services-container'
                : ''
            }
          >
            {loading ? (
              <div className="text-center">
                <Spin size="small" />
              </div>
            ) : (
              selectedItemsView
            )}
          </div>

          <div id={this.id} className="mcs-treeSelectWithList_container">
            <TreeSelect
              treeData={treeData}
              value={value}
              placeholder={placeholder}
              onChange={handleOnChange}
              treeCheckable={true}
              maxTagCount={0}
              getPopupContainer={getRef}
              maxTagPlaceholder={placeholder}
              dropdownStyle={{ maxHeight: '200px', overflowY: 'auto' }}
            />
          </div>
        </Col>
      </FormFieldWrapper>
    );
  }
}

export default TreeSelectWithList;
