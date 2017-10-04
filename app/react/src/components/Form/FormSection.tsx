import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Row } from 'antd';

import { FormTitle } from '../Form/index';

import DropdownButton from '../DropdownButton';
import { DropdownButtonItemProps } from '../DropdownButton';


interface FormSectionProps {
  button: {
    message: string;
    onClick: React.FormEventHandler<any>; 
  };
  dropdownItems: DropdownButtonItemProps[];
  subtitle: {
    defaultMessage: string;
    id: string;
  };
  title: {
    defaultMessage: string;
    id: string;
  }
}

const FormSection: React.SFC<FormSectionProps> = props => {

  return (
    <Row
      type="flex"
      align="middle"
      justify="space-between"
      className="section-header"
    >
      <FormTitle
        titleMessage={props.title}
        subTitleMessage={props.subtitle}
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

FormSection.propTypes = {
 
};

export default FormSection;
