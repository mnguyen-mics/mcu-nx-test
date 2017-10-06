/* eslint-disable */
import * as React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export interface FormTitleProps {
  title: FormattedMessage.MessageDescriptor;
  subtitle?: FormattedMessage.MessageDescriptor;
}


const FormTitle: React.SFC<FormTitleProps> = ({ title, subtitle}) => {

  return (
    <div className="title-container">
      <div className="title">
      <FormattedMessage
        {...title}
      />
      </div>
      {!!subtitle &&
        <div className="subtitle">
        <FormattedMessage
          {...subtitle}
        />
        </div>
      }
    </div>
  )
};

FormTitle.defaultProps = {
  subtitle: null
};

export default FormTitle;
