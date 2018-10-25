import * as React from 'react';

export interface TableBodyProps {
}

export default class TableBody extends React.Component<TableBodyProps, any> {
  public render() {
    const {
      children
    } = this.props;
    return (
      <tbody className="ant-table-tbody">
        {children}
      </tbody>
    );
  }
}
