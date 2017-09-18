import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Table } from 'antd';
import { Field, FieldArray } from 'redux-form';

import { ButtonStyleless, Form, McsIcons } from '../../../../../components';
import generateGuid from '../../../../../utils/generateGuid';

const { SwitchInput } = Form;

function AdGroupTableWrapper({ dataSource, updateTableFieldStatus, tableName }) {

  function AdGroupTable() {

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
          <ButtonStyleless onClick={updateTableFieldStatus({ index, tableName })}>
            <McsIcons type="delete" style={{ fontSize: 20 }} />
          </ButtonStyleless>
      ),
      },
    ];

    return (
      <div className="adGroup-table">
        <Table
          className={dataSource.length ? 'border-style' : 'hide-section'}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          showHeader={false}
        />
      </div>
    );
  }

  AdGroupTable.propTypes = {
    fields: PropTypes.shape().isRequired,
  };

  return <FieldArray name={tableName} component={AdGroupTable} />;
}

AdGroupTableWrapper.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  updateTableFieldStatus: PropTypes.func.isRequired,
  tableName: PropTypes.string.isRequired,
};


export default AdGroupTableWrapper;
