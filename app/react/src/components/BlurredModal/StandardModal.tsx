import * as React from 'react';
import FullScreenModal, {
  FullScreenFormModalProps,
} from './FullScreenFormModal';
import { FormModalWrapperProps } from './FormModalWrapper';
import { Omit } from '../../utils/Types';

export interface StandardModalProps
  extends FullScreenFormModalProps,
    Omit<FormModalWrapperProps, 'formId'> {
    isBackdrop?: boolean;
}

export default class StandardModal extends React.Component<
  StandardModalProps,
  any
> {
  public render() {
    const {
      opened,
      onClose,
      children,
      isBackdrop,
    } = this.props;
    const click = isBackdrop ? onClose : () => ({})
    return (
      <FullScreenModal opened={opened} blurred={false}>
        <div className="form-card-modal dark" onClick={click}>
          <div className="form-modal-container">
            {children}
          </div>
        </div>
      </FullScreenModal>
    );
  }
}
