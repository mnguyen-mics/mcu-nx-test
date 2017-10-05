import React from 'react';
import { filter } from 'lodash';
import PropTypes from 'prop-types';
import { Checkbox, Table } from 'antd';
import { CheckboxWithSign } from '../../../../../components/Form';

import messages from '../messages';

function PlacementTable({ formatMessage, placements }) {

  const formatDataSource = (type, title) => {
    const filteredValues = filter(placements, { type });
    const allValuesChecked = !filteredValues.find(elem => !elem.checked);
    const titleRow = {
      checked: { isTitle: true, value: allValuesChecked },
      key: 'title',
      name: { isTitle: true, value: title },
    };

    const otherRows = filteredValues.map(elem => ({
      checked: { value: elem.checked },
      key: elem.id,
      name: { value: elem.name },
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
      render: text => {
        const className = (text.isTitle ? 'bold titleRowName' : 'regularRowName');

        return <div className={className}>{text.value}</div>;
      },
    },
     // this.truc(record.id)
    {
      width: '10%',
      dataIndex: 'checked',
      key: 'checked',
      render: (checked, record) => (checked.isTitle
          ? <CheckboxWithSign sign={checked.value ? '+' : '-'} />
          : (
            <Checkbox
              checked={checked.value}
              onChange={() => {}}
            />
          )

      ),
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
