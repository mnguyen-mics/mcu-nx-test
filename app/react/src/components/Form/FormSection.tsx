import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Row } from 'antd';

import FormTitle, { FormTitleProps } from './FormTitle';

import DropdownButton from '../DropdownButton';
import { DropdownButtonItemProps } from '../DropdownButton';


interface FormSectionProps {
  button?: {
    message: string;
    onClick: React.FormEventHandler<any>; 
  };
  dropdownItems?: DropdownButtonItemProps[];  
}

const FormSection: React.SFC<FormSectionProps & FormTitleProps> = props => {

  return (
    <Row
      type="flex"
      align="middle"
      justify="space-between"
      className="section-header"
    >
      <FormTitle
        title={props.title}
        subtitle={props.subtitle}
      />

      {props.button
        ? <Button onClick={props.button.onClick}>{props.button.message}</Button>
        : null
      }

      {props.dropdownItems
        ? <DropdownButton items={props.dropdownItems} />
        : null
      }
    </Row>
  );
}

FormSection.defaultProps = {
  button: null,
  dropdownItems: null,
};

export default FormSection;
