import * as React from 'react';

export interface ICardFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

interface State {
}

export default class CardFlex extends React.Component<ICardFlexProps, State> {
  public render() {
    const { children, className, title, ...rest } = this.props;
    return (
      <div className={`card-flex mcs-card compact ${className ? className : '' }`} {...rest}>
        {title ? (<div className="title">{title}</div>) : undefined}
        {children}
        {/* <div className="card-footer">
          <a className="left">Edit Query</a>
          <a className="right">View Description</a>
        </div> */}
      </div>
    );
  }
}
