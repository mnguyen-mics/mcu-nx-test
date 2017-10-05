import React from 'react';
import { filter } from 'lodash';
import PropTypes from 'prop-types';
import { Avatar, Checkbox, Table } from 'antd';
import { CheckboxWithSign } from '../../../../../components/Form';

import messages from '../messages';

function PlacementTable({ formatMessage, placements }) {

  const formatDataSource = (type, title) => {
    const filteredValues = filter(placements, { type });
    const numberOfCheckedElements = filteredValues.filter(elem => elem.checked);
    const checkboxType = (numberOfCheckedElements.length < filteredValues.length
      ? (!numberOfCheckedElements.length ? 'none' : 'some')
      : 'all'
    );

    const titleRow = {
      checked: { isTitle: true, value: checkboxType },
      key: 'title',
      name: { isTitle: true, text: title },
    };

    const otherRows = filteredValues.map(elem => ({
      checked: { value: elem.checked },
      key: elem.id,
      name: { icon: elem.icon, text: elem.name },
    }));

    return [titleRow, ...otherRows];
  };

  const webPlacements = formatDataSource('web', formatMessage(messages.contentSection9TypeWebsites));
  const mobilePlacements = formatDataSource('mobile', formatMessage(messages.contentSection9TypeMobileApps));

  const columns = [
    {
      width: '90%',
      dataIndex: 'name',
      key: 'name',
      render: value => (value.isTitle
        ? <div className="bold rowName">{value.text}</div>
        : (
          <div className="align-vertically rowName">
            <Avatar shape="square" size="small" src={value.icon} />
            <p className="margin-from-icon">{value.text}</p>
          </div>
        )
      ),
    },
     // this.truc(record.id)
    {
      width: '10%',
      dataIndex: 'checked',
      key: 'checked',
      render: (checked, record) => {
        const value = (checked.isTitle
          ? (checked.value === 'all' ? true : false)
          : checked.value
        );

        return (checked.value === 'some'
          ? <CheckboxWithSign sign="-" />
          : (
            <Checkbox
              checked={value}
              onChange={() => {}}
            />
          )
        );
      },
      title: 'todo',
    },
  ];

  return (
    <div className="placement-table">
      <Table
        columns={columns}
        dataSource={webPlacements}
        pagination={false}
        showHeader={false}
      />

      <Table
        className="remove-margin-between-tables"
        columns={columns}
        dataSource={mobilePlacements}
        pagination={false}
        showHeader={false}
      />
    </div>
  );
}

PlacementTable.defaultProps = {
  placements: [],
};


PlacementTable.propTypes = {
  formatMessage: PropTypes.func.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),
};

export default PlacementTable;
