import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { submit as rxfSubmit } from 'redux-form';
import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormattedMessage } from 'react-intl';
import { Omit } from '../../../utils/Types';
import NewExportSimpleForm, { NewExportSimpleFormData, FORM_ID } from './NewExportSimpleForm';

export interface SaveAsExportModalProps extends Omit<ModalProps, 'onOk'> {
  onOk: (exportFormData: NewExportSimpleFormData) => void;
  csvExportDisabled?: boolean;
}

interface MapDispatchToProps {
  submit: (formId: string) => void;
}

type Props = MapDispatchToProps & SaveAsExportModalProps;

class SaveAsExportModal extends React.Component<Props, FormData> {
  render() {
    const { onOk, submit, visible, csvExportDisabled, ...modalProps } = this.props;

    const handleOnOk = () => {
      submit(FORM_ID);
    };

    const handleOnSubmit = (exportFormData: NewExportSimpleFormData) => {
      onOk(exportFormData);
    };

    return (
      <Modal
        {...modalProps}
        visible={visible}
        onOk={handleOnOk}
        title={
          <FormattedMessage
            id='queryTool.query-tool-modal-saveas-export-title'
            defaultMessage='Save As Export'
          />
        }
      >
        {visible && (
          <NewExportSimpleForm onSubmit={handleOnSubmit} csvExportDisabled={csvExportDisabled} />
        )}
      </Modal>
    );
  }
}

export default compose<Props, SaveAsExportModalProps>(connect(undefined, { submit: rxfSubmit }))(
  SaveAsExportModal,
);
