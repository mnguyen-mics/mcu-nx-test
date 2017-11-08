import * as React from 'react';
import { Col } from 'antd';
import { TooltipProps } from 'antd/lib/tooltip';
import { ButtonStyleless, McsIcons } from '../';
import SearchAndMultiSelect, { MenuItemProps } from '../SearchAndMultiSelect';
import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface FormSearchAndMultiSelectProps {
  label: string;
  placeholder?: string;
  datasource: MenuItemProps[];
  tooltipProps: TooltipProps;
  value: string[];
  handleClickOnRemove: (key: string) => void;
  handleClickOnItem: (key: string) => void;
}

const FormSearchAndMultiSelect: React.SFC<FormSearchAndMultiSelectProps & FormFieldWrapperProps> = props => {

  const {
    label,
    placeholder,
    datasource,
    tooltipProps,
    value,
    handleClickOnRemove,
    handleClickOnItem,
  } = props;

  const selectedItemsView = value.map(key => {
    const foundData = datasource.find(data => data.key === key);
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleClickOnRemove(key);
    };
    return (
      <div key={key} className="audience-service-item">
        {foundData ? foundData.label : ''}
        <ButtonStyleless
          className="remove-button"
          onClick={handleClick}
        >
          <McsIcons type="close" />
        </ButtonStyleless>
      </div>
    );
  });

  const flexAlign = value.length > 0 ? 'top' : 'middle';

  return (
    <FormFieldWrapper
      label={label}
      rowProps={{ align: flexAlign }}
      helpToolTipProps={tooltipProps}
    >
        <Col span={22}>
          <div className={value.length ? 'selected-audience-services-container' : ''}>
            {selectedItemsView}
          </div>
          <SearchAndMultiSelect
            onClick={handleClickOnItem}
            placeholder={placeholder}
            datasource={datasource}
            value={value}
          />
        </Col>
    </FormFieldWrapper>
  );
};

export default FormSearchAndMultiSelect;
