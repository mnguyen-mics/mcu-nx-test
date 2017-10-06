import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { arrayInsert, arrayRemove, Field } from 'redux-form';
import { Avatar, Checkbox, Table } from 'antd';
import { CheckboxWithSign, FormCheckbox } from '../../../../../components/Form';

class PlacementTable extends Component {

  buildColumns = () => {
    return [
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
      {
        width: '10%',
        dataIndex: 'checked',
        key: 'checked',
        render: (checked, record, i) => {
          if (!checked.isTitle) {
            return (
              <Field
                component={FormCheckbox}
                name={`placements.${this.props.type}.${i - 1}.checked`}
                type="checkbox"
              />
            );
          }

          const isAllChecked = checked.value === 'all';

          return (checked.value === 'some'
            ? <CheckboxWithSign onClick={this.updateAllCheckboxes(!isAllChecked)} sign="-" />
            : <Checkbox checked={isAllChecked} onClick={this.updateAllCheckboxes(!isAllChecked)} />
          );
        },
        title: 'todo',
      },
    ];
  }

  buildDataSource = () => {
    const { placements, title } = this.props;
    const numberOfCheckedElements = placements.filter(elem => elem.checked);
    const checkboxType = (numberOfCheckedElements.length < placements.length
      ? (!numberOfCheckedElements.length ? 'none' : 'some')
      : 'all'
    );

    const titleRow = {
      checked: { isTitle: true, value: checkboxType },
      key: 'title',
      name: { isTitle: true, text: title },
    };

    const otherRows = placements.map(elem => ({
      checked: { name: elem.name, value: elem.checked },
      key: elem.id,
      name: { icon: elem.icon, text: elem.text },
    }));

    return [titleRow, ...otherRows];
  };

  updateAllCheckboxes = (bool) => () => {
    const { formName, placements, type } = this.props;

    placements.forEach((placement, index) => {
      if (placement.checked !== bool) {
        const tableName = `placements.${type}`;
        const newState = { ...placement, checked: bool };

        this.props.arrayRemove(formName, tableName, index);
        this.props.arrayInsert(formName, tableName, index, newState);
      }
    });
  }

  render() {
    return (
      <Table
        columns={this.buildColumns()}
        dataSource={this.buildDataSource()}
        pagination={false}
        showHeader={false}
      />
    );
  }
}

PlacementTable.defaultProps = {
  placements: [],
};


PlacementTable.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  formName: PropTypes.string.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),

  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const mapDispatchToProps = { arrayInsert, arrayRemove };

export default connect(null, mapDispatchToProps)(PlacementTable);
