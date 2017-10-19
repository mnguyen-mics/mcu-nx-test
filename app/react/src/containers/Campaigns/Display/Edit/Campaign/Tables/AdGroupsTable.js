import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

import { ButtonStyleless, McsIcons } from '../../../../../../components/index.ts';

class AdGroupsTable extends Component {

  render() {

    const { dataSource, loading, tableName, updateTableFieldStatus, openEditionMode } = this.props;

    const columns = [
      {
        colSpan: 8,
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <div className="display-row center-vertically row-height">
            <div className="icon-round-border">
              <McsIcons
                type={type.image}
                style={{ color: '#00a1df', fontSize: 24, margin: 'auto' }}
              />
            </div>
            {type.name}
          </div>),
      },
      {
        colSpan: 13,
        dataIndex: 'default',
        key: 'default',
        render: () => {
          return <span />;
          // return (
          //   // <span>
          //   //   <Field
          //   //     component={SwitchInput}
          //   //     name={`${tableName}[${data.index}].default`}
          //   //     value={data.bool}
          //   //     type="checkbox"
          //   //     onChange={() => updateTableFieldStatus({ index: data.index, tableName })}
          //   //   /> Is default</span>
          // );
        },
      },

      {
        colSpan: 3,
        dataIndex: 'toBeRemoved',
        key: 'toBeRemoved',
        className: 'text-right',
        render: (index, record) => (
          <span>
            <ButtonStyleless onClick={(e) => { e.preventDefault(); openEditionMode(record); }}>
              <McsIcons type="pen" style={{ fontSize: 20 }} />
            </ButtonStyleless>
            <ButtonStyleless onClick={(e) => { e.preventDefault(); updateTableFieldStatus({ index, tableName }); }}>
              <McsIcons type="delete" style={{ fontSize: 20 }} />
            </ButtonStyleless>
          </span>
      ),
      },
    ];

    const tableStyle = (dataSource.length || loading ? 'border-style' : 'hide-section');

    return (
      <div className="adGroup-table testeu">
        <Table
          className={tableStyle}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          showHeader={false}
        />
      </div>
    );
  }
}

AdGroupsTable.defaultProps = {
  loading: false,
};


AdGroupsTable.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool,
  tableName: PropTypes.string.isRequired,
  updateTableFieldStatus: PropTypes.func.isRequired,
  openEditionMode: PropTypes.func.isRequired,
};

export default AdGroupsTable;
