import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { FormAction, isSubmitting, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button/button';
import { compose } from 'recompose';

import McsIcon from '../McsIcon';
import ActionBar, { ActionBarProps } from '../ActionBar';
import { Omit } from '../../utils/Types';

export interface FormLayoutActionbarProps
  extends Omit<ActionBarProps, 'edition'> {
  formId?: string;
  message?: FormattedMessage.MessageDescriptor;
  onClose?: React.MouseEventHandler<HTMLSpanElement>;
  disabled?: boolean;
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
  const { dispatch, formId, message, onClose, submitting, disabled } = props;

  const submitButtonProps: ButtonProps = {
    disabled: submitting,
    htmlType: 'submit',
    onClick: () => dispatch && formId && dispatch(submit(formId)),
    type: 'primary',
  };

  return (
    <ActionBar edition={true} {...props}>
      {message && !disabled ? (
        <Button {...submitButtonProps} className="mcs-primary">
          <McsIcon type="plus" />
          <FormattedMessage {...message} />
        </Button>
      ) : null}

      <McsIcon
        type="close"
        className="close-icon"
        style={{ cursor: 'pointer' }}
        onClick={onClose}
      />
    </ActionBar>
  );
};

export default compose<
  FormLayoutActionbarProvidedProps,
  FormLayoutActionbarProps
>(
  connect((state, ownProps: FormLayoutActionbarProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    submitting: isSubmitting(ownProps.formId!)(state),
  })),
)(FormLayoutActionbar);
