import * as React from 'react';
import { createPortal } from 'react-dom';

export interface FullScreenFormModalProps {
  opened?: boolean;
  blurred?: boolean;
}

export default class FullScreenModal extends React.Component<FullScreenFormModalProps> {

  el: HTMLDivElement;

  constructor(props: FullScreenFormModalProps) {
    super(props);
    this.el = document.createElement('div');
  }

  setRootClassName = (remove?: boolean, blurred?: boolean) => {
    const appRoot = document.getElementById('mcs-full-page');
    if (appRoot && !remove && blurred)
      appRoot.classList.add('form-modal-blurred-open')
    if (appRoot && !remove && !blurred)
      appRoot.classList.add('form-modal-open')
    if (appRoot && remove) {
      appRoot.classList.remove('form-modal-blurred-open')
      appRoot.classList.remove('form-modal-open')
    }
  }

  componentDidMount() {
    const {blurred} = this.props;
    const modalRoot = document.getElementById('mcs-edit-modal');
    if (modalRoot)
      modalRoot.appendChild(this.el);
    if (this.props.opened) {
      this.setRootClassName(false, blurred)
    }
  }

  componentDidUpdate(previousProps: FullScreenFormModalProps) {
    const {blurred, opened} = this.props;

    const {opened: previousOpened} = previousProps;

    if (!previousOpened && opened) {
      this.setRootClassName(false, blurred)
    } else if (previousOpened && !opened) {
      this.setRootClassName(true, blurred)
    }
  }
  

  componentWillUnmount() {
    const modalRoot = document.getElementById('mcs-edit-modal');
    if (modalRoot) {
      modalRoot.removeChild(this.el);
    }
    this.setRootClassName(true)
  }


  render() {
    return this.props.opened && createPortal(
      this.props.children,
      this.el,
    );
  }
}
