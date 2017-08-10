import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row } from 'antd';

import { FormTitle } from '../Form';
import DropdownButton from '../DropdownButton';

function FormSection({ button, dropdownItems, subtitle, title }) {

  return (
    <Row
      type="flex"
      align="middle"
      justify="space-between"
      className="section-header"
    >
      <FormTitle
        titleMessage={title}
        subTitleMessage={subtitle}
      />

      {button
        ? <Button onClick={button.onClick}>{button.message}</Button>
        : null
      }

      {dropdownItems
        ? <DropdownButton items={dropdownItems} />
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
  button: PropTypes.shape({
    message: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),

  dropdownItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.shape().isRequired,
    onClick: PropTypes.func.isRequired,
  })),

  subtitle: PropTypes.shape({
    defaultMessage: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,

  title: PropTypes.shape({
    defaultMessage: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default FormSection;
