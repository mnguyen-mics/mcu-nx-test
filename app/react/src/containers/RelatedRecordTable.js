import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Table } from 'antd';
import { Field } from 'redux-form';

import { ButtonStyleless, Form, McsIcons } from '../components';
import generateGuid from '../utils/generateGuid';

const { SwitchInput } = Form;

function RelatedRecordTable({ dataSource, loading, tableName, updateTableFieldState }) {
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
        </div>
    ),
    },
    {
      colSpan: 6,
      dataIndex: 'info',
      key: 'info',
      /* In render, info is either an array of string of an array of { image: '', name: '' } */
      render: (info) => {
        const elemToDisplay = (elem) => (elem.image
            ? (
              <div className="display-row" key={generateGuid()}>
                <McsIcons type={elem.image} style={{ fontSize: 20 }} />
                <p>{elem.name}</p>
              </div>
            )
            : <p key={generateGuid()}>{elem}</p>
          );

        return (
          <div className="display-row data-content row-height">
            {info.map(elem => elemToDisplay(elem))}
          </div>
        );
      },
    },
    {
      colSpan: 9,
      dataIndex: 'include',
      key: 'include',
      render: (data = {}) => {
        const displaySwitch = !!Object.keys(data).length;

        return (
          <div className={displaySwitch ? '' : 'visibility-hidden'} >
            <div className="display-row align-left">
              {displaySwitch
                ? (
                  <Field
                    component={SwitchInput}
                    name={`${tableName}[${data.index}].include`}
                    type="checkbox"
                  />
                )
                : <Switch />
              }

              <p className="switch-title-padding">
                {data.bool ? 'Target' : 'Exclude'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      colSpan: 1,
      dataIndex: 'toBeRemoved',
      key: 'toBeRemoved',
      render: (index) => (
        <ButtonStyleless onClick={updateTableFieldState({ index, tableName })}>
          <McsIcons type="delete" style={{ fontSize: 20 }} />
        </ButtonStyleless>
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

RelatedRecordTable.defaultProps = {
  loading: false,
};


RelatedRecordTable.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool,
  tableName: PropTypes.string.isRequired,
  updateTableFieldState: PropTypes.func.isRequired,
};

export default RelatedRecordTable;
