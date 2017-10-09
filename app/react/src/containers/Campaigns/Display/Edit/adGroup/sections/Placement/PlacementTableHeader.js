import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { arrayInsert, arrayRemove } from 'redux-form';
import { Checkbox, Table } from 'antd';
import { ButtonStyleless, Form } from '../../../../../../../components';

const { CheckboxWithSign } = Form;

class PlacementTableHeader extends Component {

  state = { displayAll: false }

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
        key: 'title',
        render: () => (
          <div className="bold row-name">{this.props.title}</div>
        ),
        width: '70%',
      },
      {
        key: 'displayOption',
        render: () => (
          <div className="">
            <div>
              <ButtonStyleless
                className={this.state.displayAll ? 'theme-color' : ''}
                onClick={this.props.changeDisplayOptions(this.props.type, true)}
              >show
            </ButtonStyleless>
              <span className="button-separator">/</span>
              <ButtonStyleless
                className={!this.state.displayAll ? 'theme-color' : ''}
                onClick={this.props.changeDisplayOptions(this.props.type, false)}
              >hide
            </ButtonStyleless>
            </div>
          </div>
        ),
        width: '20%',
      },
      {
        key: 'checked',
        render: () => (
          <div className="">
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
        className={this.props.className}
        columns={this.buildColumns()}
        dataSource={[{}]}
        pagination={false}
        rowClassName={() => 'row-height'}
        showHeader={false}
      />
    );
  }
}

PlacementTableHeader.defaultProps = {
  className: '',
  placements: [],
};


PlacementTableHeader.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  changeDisplayOptions: PropTypes.func.isRequired,
  className: PropTypes.string,
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

export default connect(null, mapDispatchToProps)(PlacementTableHeader);
