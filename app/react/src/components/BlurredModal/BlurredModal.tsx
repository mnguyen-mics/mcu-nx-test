import * as React from 'react';
import FullScreenModal, {
  FullScreenFormModalProps,
} from './FullScreenFormModal';
import FormModalWrapper, { FormModalWrapperProps } from './FormModalWrapper';

export interface BlurredModalProps
  extends FullScreenFormModalProps,
    FormModalWrapperProps {
}

export default class BlurredModal extends React.Component<
  BlurredModalProps,
  any
> {
  public render() {
    const {
      opened,
      formId,
      onClose,
      footer,
      children,
    } = this.props;
    return (
      <FullScreenModal opened={opened} blurred={true}>
        <FormModalWrapper formId={formId} onClose={onClose} footer={footer}>
          {children}
        </FormModalWrapper>
      </FullScreenModal>
    );
  }
}
