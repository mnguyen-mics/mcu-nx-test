import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { FormAction, isSubmitting, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button/button';
import { compose } from 'recompose';
import { ButtonStyleless, McsIcon } from '..';


export interface FormModalWrapperProps {

  formId: string;

  message?: FormattedMessage.MessageDescriptor;

  onClose: React.MouseEventHandler<HTMLSpanElement>;
}

interface FormModalWrapperProvidedProps
  extends FormModalWrapperProps,
  DispatchProp<FormAction> {
  submitting: boolean;
}

/* Redux-form allows us to use submit buttons removed from their normal form components.
 * This component includes a remote submit button.
 * See example at http://redux-form.com/6.8.0/examples/remoteSubmit/
 */
const FormModalWrapper: React.SFC<FormModalWrapperProvidedProps> = props => {

  const {
    dispatch,
    formId,
    message,
    onClose,
    submitting,
    children
  } = props;

  const submitButtonProps: ButtonProps = {
    disabled: submitting,
    htmlType: 'submit',
    onClick: () => dispatch && dispatch(submit(formId)),
    type: 'primary',
  };

  return (
    <div className="form-modal">
      <ButtonStyleless disabled={submitting} className="form-close" onClick={onClose}><McsIcon type="close-big" /></ButtonStyleless>
      <div className="form-modal-container mcs-content-container mcs-form-container">
        {children}
        <div className="submit-button">
          {message ? <Button {...submitButtonProps} className="mcs-primary">
            <McsIcon type="plus" />
            <FormattedMessage {...message} />
          </Button> : null}
        </div>
      </div>
    </div>
  );
};

export default compose<FormModalWrapperProvidedProps, FormModalWrapperProps>(
  connect((state, ownProps: FormModalWrapperProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    submitting: isSubmitting(ownProps.formId)(state),
  }),
  ),
)(FormModalWrapper);
