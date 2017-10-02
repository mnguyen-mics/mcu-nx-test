/* eslint-disable */
import * as React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

interface FormTitleProps {
  titleMessage: FormattedMessage.Props;
  subTitleMessage: FormattedMessage.Props;
}


const FormTitle: React.SFC<FormTitleProps> = ({ titleMessage, subTitleMessage}) => {

  return (
    <div className="title-container">
      <div className="title">
      <FormattedMessage
        {...titleMessage}
      />
      </div>
      {!!subTitleMessage &&
        <div className="subtitle">
        <FormattedMessage
          {...subTitleMessage}
        />
        </div>
      }
    </div>
  )
};

FormTitle.defaultProps = {
  subTitleMessage: null
};
export default FormTitle;
