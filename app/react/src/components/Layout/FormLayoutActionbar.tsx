import * as React from 'react';
import {connect, DispatchProp} from 'react-redux';
import {FormAction, isSubmitting, submit} from 'redux-form';
import {FormattedMessage} from 'react-intl';
import {Button} from 'antd';
import {ButtonProps} from 'antd/lib/button/button';
import {compose} from 'recompose';

import McsIcons from '../McsIcons';
import ActionBar, { ActionBarProps } from '../ActionBar';

export interface FormLayoutActionbarProps extends ActionBarProps {

  formId: string;

  message?: FormattedMessage.MessageDescriptor;

  onClose: React.MouseEventHandler<HTMLSpanElement>;
}

interface FormLayoutActionbarProvidedProps
  extends FormLayoutActionbarProps,
  DispatchProp<FormAction> {
  submitting: boolean;
}

/* Redux-form allows us to use submit buttons removed from their normal form components.
 * This component includes a remote submit button.
 * See example at http://redux-form.com/6.8.0/examples/remoteSubmit/
 */
const FormLayoutActionbar: React.SFC<FormLayoutActionbarProvidedProps> = props => {

  const {
    dispatch,
    formId,
    message,
    onClose,
    submitting,
  } = props;

  const submitButtonProps: ButtonProps = {
    disabled: submitting,
    htmlType: 'submit',
    onClick: () => dispatch && dispatch(submit(formId)),
    type: 'primary',
  };

  return (
    <ActionBar edition={true} {...props}>
      { message ? <Button {...submitButtonProps} className="mcs-primary">
        <McsIcons type="plus"/>
        <FormattedMessage {...message} />
      </Button> : null }

      <McsIcons
        type="close"
        className="close-icon"
        style={{cursor: 'pointer'}}
        onClick={onClose}
      />
    </ActionBar>
  );
};

export default compose<FormLayoutActionbarProvidedProps, FormLayoutActionbarProps>(
  connect((state, ownProps: FormLayoutActionbarProps) => ({
      /* For additional redux-form selectors, such as "pristine" or "form errors",
       * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
       */
      submitting: isSubmitting(ownProps.formId)(state),
    }),
  ),
)(FormLayoutActionbar);
