import * as React from 'react';
import { Switch, Table } from 'antd';
import { Field } from 'redux-form';

import { ButtonStyleless, Form, McsIcons } from '../components';
import generateGuid from '../utils/generateGuid';

const { SwitchInput } = Form;

interface RelatedRecordTableProps {
  dataSource: Array<{}>;
  loading: boolean;
  tableName: string;
  updateTableFieldState: (obj: {index: number, tableName: string}) => (e: any) => void;
}

const RelatedRecordTable: React.SFC<RelatedRecordTableProps> = props => {

  const {
    dataSource,
    loading,
    tableName,
    updateTableFieldState,
  } = props;

  const columns = [
    {
      colSpan: 8,
      dataIndex: 'type',
      key: 'type',
      render: (type: { image: string, name: string}) => (
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
      render: (info: Array<{ image?: string, name: string}>) => {
        const elemToDisplay = (elem: { image?: string, name: string}) => (elem.image
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
      render: (include = {index: null, bool: null}) => {
        const displaySwitch = include.bool !== null;

        return (
          <div className={displaySwitch ? '' : 'visibility-hidden'} >
            <div className="display-row align-left">
              {displaySwitch
                ? (
                  <Field
                    name={`${tableName}[${include.index}].include`}
                    component={SwitchInput}
                    type="checkbox"
                  />
                )
                : <Switch />
              }

              <p className="switch-title-padding">
                {include.bool ? 'Target' : 'Exclude'}
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
      render: (index: number) => {
        return (
          <ButtonStyleless onClick={updateTableFieldState({ index, tableName })}>
            <McsIcons type="delete" style={{ fontSize: 20 }} />
          </ButtonStyleless>
        );
      },
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
};

RelatedRecordTable.defaultProps = {
  loading: false,
};

export default RelatedRecordTable;
