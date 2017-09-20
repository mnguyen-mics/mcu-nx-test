/* eslint-disable */
import * as React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

interface FormTitleProps {
  titleMessage: FormattedMessage.Props;
  subTitleMessage: FormattedMessage.Props;
}


const FormTitle: React.SFC<FormTitleProps> = props => {

  return (
    <div className="title-container">
      <div className="title">
      <FormattedMessage
        {...props.titleMessage}
      />
      </div>
      {!!props.subTitleMessage &&
        <div className="subtitle">
        <FormattedMessage
          {...props.subTitleMessage}
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
