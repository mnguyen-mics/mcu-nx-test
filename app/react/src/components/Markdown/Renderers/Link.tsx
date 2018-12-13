import * as React from 'react';

export interface LinkProps {
  href: string;
}

export default class Link extends React.Component<LinkProps, any> {
  public render() {
    const {
      children,
      ...rest
    } = this.props;
    return (
      <a target='_blank' {...rest}>
        {children}
      </a>
    );
  }
}
