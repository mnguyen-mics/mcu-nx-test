import * as React from 'react';
import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormattedMessage } from 'react-intl';
import { Omit } from '../../../utils/Types';
import NewUserQuerySegmentSimpleForm, {
  FORM_ID,
  NewUserQuerySimpleFormData,
} from './NewUserQuerySegmentSimpleForm';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { submit as rxfSubmit } from 'redux-form';

export interface SaveAsUserQuerySegmentModalProps extends Omit<ModalProps, 'onOk'> {
  onOk: (segmentFormData: NewUserQuerySimpleFormData) => void;
}

interface MapDispatchToProps {
  submit: (formId: string) => void;
}

type Props = MapDispatchToProps & SaveAsUserQuerySegmentModalProps;

class SaveAsUserQuerySegmentModal extends React.Component<Props> {
  render() {
    const { onOk, submit, visible, ...modalProps } = this.props;

    const handleOnOk = () => {
      submit(FORM_ID);
    };

    const handleOnSubmit = (segmentFormData: NewUserQuerySimpleFormData) => {
      onOk(segmentFormData);
    };

    return (
      <Modal
        {...modalProps}
        visible={visible}
        onOk={handleOnOk}
        okButtonProps={{
          className: 'mcs-saveAsUserQuerySegmentModal_ok_button',
        }}
        title={
          <FormattedMessage
            id='queryTool.queryTool.query-tool-modal-saveas-export'
            defaultMessage='Save As User Query Segment'
          />
        }
      >
        {visible && <NewUserQuerySegmentSimpleForm onSubmit={handleOnSubmit} />}
      </Modal>
    );
  }
}

export default compose<Props, SaveAsUserQuerySegmentModalProps>(
  connect(undefined, { submit: rxfSubmit }),
)(SaveAsUserQuerySegmentModal);
