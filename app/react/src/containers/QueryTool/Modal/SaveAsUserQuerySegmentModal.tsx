import * as React from 'react';
import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormattedMessage } from 'react-intl';
import { Omit } from '../../../utils/Types';

export interface SaveAsUserQuerySegmentModalProps extends Omit<ModalProps, 'onOk'> {
  onOk: (exportName: string) => void;
}

interface State {
  name: string;
  technicalName: string;
  defaultLifetime: string;
  defaultLifetimeUnit: 'DAYS' | 'WEEKS' | 'MONTHS';
  persisted: boolean;  
}

export default class SaveAsUserQuerySegmentModal extends React.Component<
  SaveAsUserQuerySegmentModalProps,
  State
> {
  constructor(props: SaveAsUserQuerySegmentModalProps) {
    super(props);
    this.state = { 
      name: '',
      technicalName: '',
      defaultLifetime: '',
      defaultLifetimeUnit: 'DAYS',
      persisted: false
    };
  }

  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value })
  }

  render() {
    const { onOk, ...modalProps } = this.props;
    const { name } = this.state;

    const handleOnOk = () => {
      if (!name.trim()) onOk(name.trim());
    };

    return (
      <Modal
        {...modalProps}
        onOk={handleOnOk}
        title={
          <FormattedMessage
            id="query-tool-modal-saveas-export"
            defaultMessage="Save As Audience"
          />
        }
      >
        TODO 
      </Modal>  
    );
  }
}
