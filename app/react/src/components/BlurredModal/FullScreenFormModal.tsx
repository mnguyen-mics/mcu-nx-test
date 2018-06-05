import * as React from 'react';
import { createPortal } from 'react-dom';

export interface FullScreenFormModalProps {
  opened?: boolean;
}

export default class FullScreenModal extends React.Component<FullScreenFormModalProps, any> {

  el: HTMLDivElement;

  constructor(props: FullScreenFormModalProps) {
    super(props);
    this.el = document.createElement('div');
  }

  setRootClassName = (remove?: boolean) => {
    const appRoot = document.getElementById('mcs-full-page');
    if (appRoot && !remove)
      appRoot.classList.add('form-modal-open')
    if (appRoot && remove)
      appRoot.classList.remove('form-modal-open')
  }

  componentDidMount() {
    const modalRoot = document.getElementById('mcs-edit-modal');
    if (modalRoot)
      modalRoot.appendChild(this.el);
    if (this.props.opened) {
      this.setRootClassName()
    }
  }

  componentWillReceiveProps(nextProps: FullScreenFormModalProps) {
    if (!this.props.opened && nextProps.opened) {
      this.setRootClassName()
    } else if (this.props.opened && !nextProps.opened) {
      this.setRootClassName(true)
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
