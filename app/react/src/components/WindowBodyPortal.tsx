/* tslint:disable */
import * as React from 'react';
import { createPortal } from 'react-dom';

export default class WindowBodyPortal extends React.Component<any> {
  el = document.createElement('div');

  constructor(props: any) {
    super(props);
    // this.el.setAttribute('class', 'query-builder')
  }

  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    this.el.focus();
    return createPortal(this.props.children, this.el);
  }
}
