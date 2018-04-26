import * as React from 'react';
import { CSSTransition } from "react-transition-group";

export interface FadeProps {
}

export default class Fade extends React.Component<FadeProps> {
  render() {
    const {
      children,
      ...rest
    } = this.props;
    return (<CSSTransition
      {...rest}
      timeout={1000}
      classNames="fade"
    >
      {children}
    </CSSTransition>)
  }
}

