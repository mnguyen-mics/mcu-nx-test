import * as React from 'react';

export interface TableHeadProps {
}

export default class TableHead extends React.Component<TableHeadProps, any> {
  public render() {
    const {
      children
    } = this.props;
    return (
      <thead className="ant-table-thead">
        {children}
      </thead>
    );
  }
}
