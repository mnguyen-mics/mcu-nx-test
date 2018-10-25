import * as React from 'react';

export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default class Root extends React.Component<RootProps, any> {
  public render() {
    const {
      className,
      children,
      ...rest
    } = this.props;

    return (
      <div className={`root-md ${className ? className : ''}`} {...rest}>
        {children}
      </div>
    );
  }
}
