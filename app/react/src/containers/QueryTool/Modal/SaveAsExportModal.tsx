import * as React from 'react';
import { Modal, Input } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormattedMessage } from 'react-intl';
import { Omit } from '../../../utils/Types';

export interface SaveAsExportModalProps extends Omit<ModalProps, 'onOk'> {
  onOk: (exportName: string) => void;
}

interface State {
  exportName: string;
}

export default class SaveAsExportModal extends React.Component<
  SaveAsExportModalProps,
  State
> {
  constructor(props: SaveAsExportModalProps) {
    super(props);
    this.state = { exportName: '' };
  }

  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ exportName: e.target.value })
  }

  render() {
    const { onOk, ...modalProps } = this.props;
    const { exportName } = this.state;

    const handleOnOk = () => {
      if (!exportName.trim()) onOk(exportName.trim());
    };

    return (
      <Modal
        {...modalProps}
        onOk={handleOnOk}
        title={
          <FormattedMessage
            id="query-tool-modal-saveas-export-title"
            defaultMessage="Save As Export"
          />
        }
      >
        <p>
          <FormattedMessage
            id="query-tool-modal-saveas-export-inputlabel"
            defaultMessage="Give your export a name to find it back on the export screen."
          />
        </p>
        <Input 
          value={exportName}
          onChange={this.handleOnChange}
          placeholder="Export Name" 
        />
      </Modal>  
    );
  }
}
