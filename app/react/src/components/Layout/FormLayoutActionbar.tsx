import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { FormAction, isSubmitting, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button/button';
import { compose } from 'recompose';
import { Omit } from '../../utils/Types';
import { DataResponse } from '../../services/ApiService';
import { QueryResource } from '../../models/datamart/DatamartResource';
import Convert2Otql from '../../containers/QueryTool/SaveAs/Convet2Otql';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { ActionbarProps } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar';

export interface FormLayoutActionbarProps
  extends Omit<ActionbarProps, 'edition'> {
  formId?: string;
  message?: FormattedMessage.MessageDescriptor;
  onClose?: React.MouseEventHandler<HTMLSpanElement>;
  disabled?: boolean;
  convert2Otql?: () => Promise<DataResponse<QueryResource>>;
}

type Props = FormLayoutActionbarProps &
    DispatchProp<FormAction> & 
    {
      submitting: boolean;
    }

interface State {
  conversionModalVisible: boolean;
}

/* Redux-form allows us to use submit buttons removed from their normal form components.
 * This component includes a remote submit button.
 * See example at http://redux-form.com/6.8.0/examples/remoteSubmit/
 */
class FormLayoutActionbar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      conversionModalVisible: false
    };
  }

  render() {

    const { dispatch, formId, message, onClose, submitting, disabled, convert2Otql } = this.props;

    const submitButtonProps: ButtonProps = {
      disabled: submitting,
      htmlType: 'submit',
      onClick: () => dispatch && formId && dispatch(submit(formId)),
      type: 'primary',
      className: `mcs-form_saveButton_${formId}`
    };

    const openConversionModal = () => this.setState({ conversionModalVisible: true })
    const closeConversionModal = () => this.setState({ conversionModalVisible: false })

   

    return (
      <Actionbar edition={true} {...this.props}>
        {message && !disabled ? (
          <Button {...submitButtonProps} className={`mcs-primary ${formId ? `mcs-form_saveButton_${formId}` : ''}`}>
            <McsIcon type="plus" />
            <FormattedMessage {...message} />
          </Button>
        ) : null}

        {convert2Otql && <Button onClick={openConversionModal}>
            <FormattedMessage
              id="queryTool.query-builder.actionbar.convert"
              defaultMessage="Convert to OTQL"
            />
        </Button>}
        {convert2Otql && this.state.conversionModalVisible && <Convert2Otql 
          onOk={closeConversionModal}
          onCancel={closeConversionModal}
          footer={null}
          visible={this.state.conversionModalVisible}
          convertQuery={convert2Otql}
        />}
        <McsIcon
          type="close"
          className="close-icon"
          style={{ cursor: 'pointer' }}
          onClick={onClose}
        />
      </Actionbar>
    );
  }

};

export default compose<
Props, FormLayoutActionbarProps
>(
  connect((state, ownProps: FormLayoutActionbarProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    submitting: isSubmitting(ownProps.formId!)(state),
  })),
)(FormLayoutActionbar);