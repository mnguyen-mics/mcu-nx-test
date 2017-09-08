import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { Field, FieldArray } from 'redux-form';

import { ButtonStyleless, Form, McsIcons } from '../../../../../components';
import generateGuid from '../../../../../utils/generateGuid';

const { SwitchInput } = Form;

function AdGroupTableWrapper({ dataSource, tableName }) {

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
        colSpan: 9,
        dataIndex: 'switchButton',
        key: 'switchButton',
        render: (bool) => {
          console.log('bool = ', bool);

          return (
            <div>
              {bool !== undefined
                ? (
                  <div className="display-row align-left">
                    <Field
                      component={SwitchInput}
                      name={`${tableName}.switch`}
                      type="checkbox"
                    />

                    <p className="switch-title-padding">
                      {bool ? 'Target' : 'Exclude'}
                    </p>
                  </div>
                )
                : null
              }
            </div>
          );
        },
      },
      {
        colSpan: 1,
        dataIndex: 'deleteButton',
        key: 'deleteButton',
        render: (bool) => (
          <ButtonStyleless>
            <McsIcons type="delete" style={{ fontSize: 20 }} />
          </ButtonStyleless>
      ),
      },
    ];

    return (
      <div className="adGroup-table">
        <Table
          className="border-style"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          showHeader={false}
        />
      </div>
    );
  }

  AdGroupTable.defaultProps = {
    // fields: [],
  };

  AdGroupTable.propTypes = {
    fields: PropTypes.shape().isRequired,
  };

  return <FieldArray name={tableName} component={AdGroupTable} />;
}

AdGroupTableWrapper.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  tableName: PropTypes.string.isRequired,
};


export default AdGroupTableWrapper;
