import React from 'react';
import PropTypes from 'prop-types';
import { Table, Switch } from 'antd';

import { ButtonStyleless, McsIcons } from '../../../../../components';
import generateGuid from '../../../../../utils/generateGuid';


// TODO: add dynamic fields with redux-form
// See at http://redux-form.com/6.8.0/docs/api/FieldArray.md/

function AdGroupTable({ dataSource }) {

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
          {type.text}
        </div>
      ),
    },
    {
      colSpan: 6,
      dataIndex: 'data',
      key: 'data',
      render: (data) => {
        const elemToDisplay = (elem) => (elem.image
          ? (
            <div className="display-row" key={generateGuid()}>
              <McsIcons type={elem.image} style={{ fontSize: 20 }} />
              <p>{elem.text}</p>
            </div>
          )
          : <p key={generateGuid()}>{elem}</p>
        );

        return (
          <div className="display-row data-content row-height">
            {data.map(elem => elemToDisplay(elem))}
          </div>
        );
      },
    },
    {
      colSpan: 10,
      dataIndex: 'switchButton',
      key: 'switchButton',
      render: (bool) => (
        <div className="display-row editable-section row-height">
          {bool !== undefined
            ? (
              <div className="display-row">
                <Switch
                  className="mcs-table-switch"
                  checked={bool}
                  onChange={() => {}}
                />

                <p className="switch-title-padding">
                  {bool ? 'Target' : 'Exclude'}
                </p>
              </div>
            )
            : null
          }

          <ButtonStyleless>
            <McsIcons type="delete" style={{ fontSize: 20 }} />
          </ButtonStyleless>
        </div>
      ),
    },
  ];

  const dataSourceWithKeys = dataSource.map(data => ({
    ...data,
    key: generateGuid(),
  }));

  return (
    <div className="adGroup-table">
      <Table
        className="border-style"
        dataSource={dataSourceWithKeys}
        columns={columns}
        pagination={false}
        showHeader={false}
      />
    </div>
  );
}

AdGroupTable.defaultProps = {
  showHeader: false,
};

AdGroupTable.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
};

export default AdGroupTable;
