/* eslint-disable */
import * as React from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

export interface FormTitleProps {
  title: MessageDescriptor;
  subtitle?: MessageDescriptor & { values?: Record<string, string | any> };
}

const FormTitle: React.SFC<FormTitleProps> = ({ title, subtitle }) => {
  return (
    <div className='title-container'>
      <div className='title'>
        <FormattedMessage {...title} />
      </div>
      {!!subtitle && (
        <div className='subtitle'>
          <FormattedMessage {...subtitle} />
        </div>
      )}
    </div>
  );
};

export default FormTitle;
