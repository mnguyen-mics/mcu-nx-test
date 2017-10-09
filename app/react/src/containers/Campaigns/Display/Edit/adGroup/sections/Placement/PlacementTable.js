import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { arrayInsert, arrayRemove, Field } from 'redux-form';
import { Avatar, Checkbox, Table } from 'antd';

import { ButtonStyleless, Form } from '../../../../../../../components';

const { CheckboxWithSign, FormCheckbox } = Form;

class PlacementTable extends Component {

  state = { displayTableOptions: true }

  buildColumns = () => {
    const { formatMessage, placements, title } = this.props;
    const numberOfCheckedRows = placements.filter(placement => placement.checked).length;
    const allIsChecked = numberOfCheckedRows === placements.length;
    const checkedStatus = (!allIsChecked
      ? (!numberOfCheckedRows ? 'none' : 'some')
      : 'all'
    );

    return [
      {
        dataIndex: 'name',
        key: 'name',
        render: value => (
          <div className="align-vertically row-name">
            <Avatar shape="square" size="small" src={value.icon} />
            <p className="margin-from-icon">{value.text}</p>
          </div>
        ),
        title: <div className="bold row-name title-wrapper">{formatMessage(title)}</div>,
        width: '70%',
      },
      {
        title: (
          <div className="title-wrapper">
            <div>
              <ButtonStyleless
                className={this.state.displayTableOptions ? 'theme-color' : ''}
                onClick={this.updateDisplayOptions(true)}
              >show
            </ButtonStyleless>
              <span className="button-separator">/</span>
              <ButtonStyleless
                className={!this.state.displayTableOptions ? 'theme-color' : ''}
                onClick={this.updateDisplayOptions(false)}
              >hide
            </ButtonStyleless>
            </div>
          </div>
        ),
        width: '20%',
      },
      {
        dataIndex: 'checked',
        key: 'checked',
        render: (checked, record, i) => (
          <Field
            component={FormCheckbox}
            name={`placements.${this.props.type}.${i}.checked`}
            type="checkbox"
          />
        ),
        title: (
          <div className="title-wrapper">
            {checkedStatus === 'some'
              ? <CheckboxWithSign onClick={this.updateAllCheckboxes(!allIsChecked)} sign="-" />
              : <Checkbox checked={allIsChecked} onClick={this.updateAllCheckboxes(!allIsChecked)} />
            }
          </div>
        ),
        width: '10%',
      },
    ];
  }

  buildDataSource = () => {
    return (this.state.displayTableOptions
      ? this.props.placements.map(elem => ({
        checked: { name: elem.name, value: elem.checked },
        key: elem.id,
        name: { icon: elem.icon, text: elem.text },
      }))
      : []
    );
  };

  updateDisplayOptions = (bool) => (e) => {
    this.setState({ displayTableOptions: bool });
    e.preventDefault();
  }

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
    const { emptyTableMessage } = this.props;
    const { displayTableOptions } = this.state;

    return (
      <div className={displayTableOptions ? '' : 'table-without-empty-message'}>
        <Table
          className="remove-margin-between-tables"
          columns={this.buildColumns()}
          dataSource={this.buildDataSource()}
          locale={{ emptyText: (displayTableOptions ? emptyTableMessage : '') }}
          pagination={false}
          scroll={{ y: 250 }}
          showHeader
        />
      </div>
    );
  }
}

PlacementTable.defaultProps = {
  placements: [],
};


PlacementTable.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  emptyTableMessage: PropTypes.string.isRequired,
  formatMessage: PropTypes.func.isRequired,
  formName: PropTypes.string.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),

  title: PropTypes.shape({
    defaultMessage: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,

  type: PropTypes.string.isRequired,
};

const mapDispatchToProps = { arrayInsert, arrayRemove };

export default connect(null, mapDispatchToProps)(PlacementTable);
