import * as React from 'react';

export interface TableRowProps {
}

export default class TableRow extends React.Component<TableRowProps, any> {
  public render() {
    const {
      children
    } = this.props;
    return (
      <tr className="ant-table-row  ant-table-row-level-0">
        {children}
      </tr>
    );
  }
}
