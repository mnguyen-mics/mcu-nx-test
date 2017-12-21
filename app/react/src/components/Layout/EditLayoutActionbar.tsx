import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { isSubmitting, submit, FormAction } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import { ButtonType } from 'antd/lib/button/button';
import McsIcons from '../McsIcons';
import { Actionbar } from '../../containers/Actionbar';

/* Redux-form allows us to use submit buttons removed from their normal form components.
 * This component includes a remote submit button.
 * See example at http://redux-form.com/6.8.0/examples/remoteSubmit/
 */

interface EditLayoutActionbarProps {
  breadcrumbPaths: Array<{
    name: string,
    url?: string,
  }>;
  dispatch?: Dispatch<FormAction>;
  formId: string;
  message: {
    id: string;
    defaultMessage: string;
  };
  onClose: () => void;
  submitting?: boolean;
  isCreativetypePicker: boolean;
  rest?: any; // ???
}

interface SubmittingProps {
  disabled: boolean;
  htmlType?: string;
  onClick: React.FormEventHandler<any>;
  type: ButtonType;
}

class EditLayoutActionbar extends React.Component<EditLayoutActionbarProps> {

  static defaultProps: Partial<EditLayoutActionbarProps> = {
    submitting: false,
    isCreativetypePicker: false,
  };

  render() {

    const {
      breadcrumbPaths,
      dispatch,
      formId,
      message,
      onClose,
      submitting,
      isCreativetypePicker,
      ...rest,
    } = this.props;

    const submitButtonProps: SubmittingProps = {
      disabled: submitting,
      htmlType: 'submit',
      onClick: () => dispatch(submit(formId)),
      type: 'primary',
    };
    return (
      <Actionbar path={breadcrumbPaths} {...rest}>
        {!isCreativetypePicker ?
          <Button {...submitButtonProps} className="mcs-primary" >
            <McsIcons type="plus" />
            <FormattedMessage {...message} />
          </Button> : null
        }

        <McsIcons
          type="close"
          className="close-icon"
          style={{ cursor: 'pointer' }}
          onClick={onClose}
        />
      </Actionbar >
    );
  }
}

export default connect(
  (state, ownProps: EditLayoutActionbarProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    submitting: isSubmitting(ownProps.formId)(state),
  }),
)(EditLayoutActionbar);
