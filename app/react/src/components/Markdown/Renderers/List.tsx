import * as React from 'react';

export interface ListProps extends  React.HTMLAttributes<HTMLLIElement | HTMLOListElement> {
  ordered?: boolean
}

export default class List extends React.Component<ListProps, any> {
  public render() {
    const {
      children,
      ordered,
    } = this.props;
    return ordered === true ? (
      <ol className='list'>
        {children}
      </ol>
    ) : (
      <ul className='list'>
        {children}
      </ul>
    );
  }
}
