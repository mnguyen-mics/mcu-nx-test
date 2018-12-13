import * as React from 'react';

export interface TableProps {
}

export default class Table extends React.Component<TableProps, any> {
  public render() {
    const {
      children
    } = this.props;

    return (
      <div className="ant-table ant-table-large ant-table-scroll-position-left">
        <div className="ant-table-content">
          <div className="ant-table-body">
            <table>
              {children}
            </table>
          </div>
        </div>
      </div>
    );
  }
}
