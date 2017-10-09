import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { arrayInsert, arrayRemove, Field } from 'redux-form';
import { Avatar, Checkbox, Table } from 'antd';
import { ButtonStyleless, Form } from '../../../../../components';

const { CheckboxWithSign, FormCheckbox } = Form;

class PlacementSearch extends Component {

  state = { displayAll: false, keyword: '' }

  changeDisplayOptions = (bool) => (e) => {
    e.preventDefault();

    this.setState({ displayAll: bool });
  }

  buildColumns = () => {
    const { placements } = this.props;
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
            <p className="margin-from-icon">{`${value.type} > ${value.text}`}</p>
          </div>
        ),
        title: (
          <input
            className="row-name search-input search-title-wrapper"
            placeholder="Q: ..."
            onChange={this.updateSearch}
            value={this.state.keyword}
          />
        ),
        width: '95%',
      },
      {
        dataIndex: 'checked',
        key: 'checked',
        render: (checked, record, i) => (
          <Field
            component={FormCheckbox}
            name={`placements.${checked.type}.${i}.checked`}
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
        width: '5%',
      },
    ];
  }

  buildDataSource = () => {
    return this.props.placements.map(elem => ({
      checked: { name: elem.name, type: elem.type, value: elem.checked },
      key: elem.id,
      name: { icon: elem.icon, text: elem.text, type: elem.type, },
    }));
  };

  updateAllCheckboxes = (bool) => () => {
    const { formName, placements } = this.props;

    placements.forEach((placement, index) => {
      if (placement.checked !== bool) {
        const tableName = `placements.${placement.type}`;
        const newState = { ...placement, checked: bool };

        this.props.arrayRemove(formName, tableName, index);
        this.props.arrayInsert(formName, tableName, index, newState);
      }
    });
  }

  updateSearch = (e) => {
    console.log('e = ', e.target.value);

    this.setState({ keyword: e.target.value });
  }

  render() {
    console.log('this.state = ', this.state);
    console.log('this.props.placements = ', this.props.placements);
    return (
      <Table
        className={this.props.className}
        columns={this.buildColumns()}
        dataSource={this.buildDataSource()}
        pagination={false}
        scroll={this.state.displayAll ? { y: 0 } : { y: 225 }}
        showHeader
      />
    );
  }
}

PlacementSearch.defaultProps = {
  className: '',
  placements: [],
};

PlacementSearch.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  className: PropTypes.string,
  formName: PropTypes.string.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),
};

const mapDispatchToProps = { arrayInsert, arrayRemove };

export default connect(null, mapDispatchToProps)(PlacementSearch);
