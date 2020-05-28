import * as React from 'react';
import { Col, Spin } from 'antd';
import { TooltipProps } from 'antd/lib/tooltip';
import { groupBy } from 'lodash';
import { ButtonStyleless, McsIcon } from '../';
import SearchAndTreeSelect, { TreeData } from '../SearchAndTreeSelect';
import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
export interface FormSearchAndTreeSelectProps {
  label: string;
  placeholder?: string;
  datasource: TreeData[];
  loading?: boolean;
  tooltipProps: TooltipProps;
  value: string[];
  handleClickOnRemove: (key: string) => void;
  handleOnChange: (checkedKeys: string[]) => void;
  small?: boolean;
  disabled?: boolean;
}

export default class FormSearchAndTreeSelect extends React.Component<
  FormSearchAndTreeSelectProps & FormFieldWrapperProps
> {
  treeLeavesCache: {
    [treeValue: string]: { treeData: TreeData; ancestors: TreeData[] };
  } = {};

  initTreeLeaves = (treeData: TreeData[]) => {
    const traverse = (tree: TreeData[], ancestors: TreeData[] = []) => {
      tree.forEach(node => {
        if (node.children && node.children.length) {
          traverse(node.children, ancestors.concat([node]));
        }

        this.treeLeavesCache[node.value] = { treeData: node, ancestors };
      });
    };

    traverse(treeData);
  };

  componentDidMount() {
    this.initTreeLeaves(this.props.datasource);
  }

  componentWillReceiveProps(nextProps: FormSearchAndTreeSelectProps) {
    const { datasource } = this.props;

    const { datasource: previousDatasource } = nextProps;
    
    if (datasource.length !== previousDatasource.length) {
      // we don't expect tree to be modified deeply hence the comparison
      this.initTreeLeaves(nextProps.datasource);
    }
  }

  render() {
    const {
      label,
      placeholder,
      datasource,
      tooltipProps,
      value,
      loading,
      handleClickOnRemove,
      handleOnChange,
      small,
      disabled
    } = this.props;

    const selectedLeaves: Array<{
      key: string;
      label: string;
      category: string;
    }> = [];

    Object.keys(this.treeLeavesCache).forEach(key => {
      if (value.includes(key)) {
        const treeLeave = this.treeLeavesCache[key];
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
            <ButtonStyleless disabled={disabled} className="remove-button" onClick={handleClick}>
              <McsIcon type="close" />
            </ButtonStyleless>
          </div>,
        );
      });
    });

    const flexAlign = value.length > 0 ? 'top' : 'middle';

    return (
      <FormFieldWrapper
        label={label}
        rowProps={{ align: flexAlign }}
        helpToolTipProps={tooltipProps}
        small={small}
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
          <SearchAndTreeSelect
            onChange={handleOnChange}
            placeholder={placeholder}
            treeData={datasource}
            checkedIds={value}
            disabled={disabled}
          />
        </Col>
      </FormFieldWrapper>
    );
  }
}
