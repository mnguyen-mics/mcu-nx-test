import * as React from 'react';
import { Switch, Table } from 'antd';
import { Field } from 'redux-form';

import { ButtonStyleless, Form, McsIcon } from '../components';
import generateGuid from '../utils/generateGuid';
import { McsIconType } from '../components/McsIcon';
import { generateFakeId } from '../utils/FakeIdHelper';

const { SwitchInput } = Form;

interface RelatedRecordTableProps {
  dataSource: Array<{}>;
  loading: boolean;
  tableName: string;
  updateTableFieldStatus: (obj: { index: number, tableName: string }) => () => void;
}

const RelatedRecordTable: React.SFC<RelatedRecordTableProps> = props => {

  const {
    dataSource,
    loading,
    tableName,
    updateTableFieldStatus,
  } = props;

  const columns = [
    {
      width: 60,
      dataIndex: 'type',
      key: 'type',
      render: (type: { image: McsIconType, name: string }) => (
        <div className="display-row center-vertically row-height">
          <div className="icon-round-border">
            <McsIcon
              type={type.image}
              additionalClass="related-records"
            />
          </div>
          {type.name}
        </div>
    ),
    },
    {
      colSpan: 11,
      dataIndex: 'info',
      key: 'info',
      /* In render, info is either an array of string of an array of { image: '', name: '' } */
      render: (info: Array<{ image?: McsIconType, name: string }>) => {
        const elemToDisplay = (elem: { image?: McsIconType, name: string }) => (elem && elem.image
            ? (
              <div className="display-row" key={generateGuid()}>
                <McsIcon type={elem.image} additionalClass="big" />
                <p>{elem.name}</p>
              </div>
            )
            : <p key={generateGuid()}> {elem}</p>
          );

        return (
          <div className="display-row row-height">
            {info.map((elem, index) => <span key={generateFakeId()} className={index !== 0 ? 'm-l-10' : ''}>{elemToDisplay(elem)}</span>)}
          </div>
        );
      },
    },
    {
      colSpan: 9,
      dataIndex: 'include',
      key: 'include',
      render: (include = { index: null, bool: null }) => {
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
      width: 60,
      dataIndex: 'toBeRemoved',
      key: 'toBeRemoved',
      render: (index: number) => {
        return (
          <ButtonStyleless onClick={updateTableFieldStatus({ index, tableName })}>
            <McsIcon type="delete" additionalClass="big" />
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
