import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

import { ButtonStyleless, McsIcons } from '../../../../../../components/index.ts';

function AdGroupsTable(props) {

  const { dataSource, loading, tableName, updateTableFieldStatus, openEditionMode } = props;

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
              additionalClass="related-records"
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
            <McsIcons type="pen" additionalClass="big" />
          </ButtonStyleless>
          <ButtonStyleless onClick={(e) => { e.preventDefault(); updateTableFieldStatus({ index, tableName }); }}>
            <McsIcons type="delete" additionalClass="big" />
          </ButtonStyleless>
        </span>
      ),
    },
  ];

  const tableStyle = (dataSource.length || loading ? 'border-style' : 'hide-section');

  return (
    <div className="related-record-table">
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
