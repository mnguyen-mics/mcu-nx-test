// import React from 'react';
// import PropTypes from 'prop-types';
// import { Field } from 'redux-form';
// import { Avatar, Table } from 'antd';
// import { Form } from '../../../../../../../components';
//
// const { FormCheckbox } = Form;
//
// function PlacementTable({
//   className,
//   displayAll,
//   placements,
//   type
// }) {
//
//   const columns = [
//     {
//       dataIndex: 'name',
//       key: 'name',
//       render: value => (
//         <div className="align-vertically row-name">
//           <Avatar shape="square" size="small" src={value.icon} />
//           <p className="margin-from-icon">{value.text}</p>
//         </div>
//         ),
//       width: '90%',
//     },
//     {
//       dataIndex: 'checked',
//       key: 'checked',
//       render: (checked, record, i) => (
//         <Field
//           component={FormCheckbox}
//           name={`placements.${type}.${i}.checked`}
//           type="checkbox"
//         />
//         ),
//       width: '10%',
//     },
//   ];
//
//   const dataSource = placements.map(elem => ({
//     checked: { name: elem.name, value: elem.checked },
//     key: elem.id,
//     name: { icon: elem.icon, text: elem.text },
//   }));
//
//   return (
//     <Table
//       className={className}
//       columns={columns}
//       dataSource={dataSource}
//       pagination={false}
//       scroll={displayAll ? { y: 0 } : { y: 225 }}
//       showHeader={false}
//     />
//   );
// }
//
// PlacementTable.defaultProps = {
//   className: '',
//   placements: [],
// };
//
//
// PlacementTable.propTypes = {
//   className: PropTypes.string,
//   displayAll: PropTypes.bool.isRequired,
//
//   placements: PropTypes.arrayOf(PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//   }).isRequired),
//
//   type: PropTypes.string.isRequired,
// };
//
// export default PlacementTable;


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sortBy } from 'lodash';
import { arrayInsert, arrayRemove, Field } from 'redux-form';
import { Avatar, Checkbox, Table } from 'antd';
import { ButtonStyleless, Form } from '../../../../../../../components';

const { CheckboxWithSign, FormCheckbox } = Form;

class PlacementTable extends Component {

  state = { displayAll: false }

  changeDisplayOptions = (bool) => (e) => {
    e.preventDefault();

    this.setState({ displayAll: bool });
  }

  buildColumns = () => {
    const { displayAll, placements, title } = this.props;
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
        title: <div className="bold row-name title-wrapper">{title}</div>,
        width: '70%',
      },
      {
        title: (
          <div className="title-wrapper">
            <div>
              <ButtonStyleless
                className={displayAll ? 'theme-color' : ''}
                onClick={this.changeDisplayOptions(true)}
              >show
            </ButtonStyleless>
              <span className="button-separator">/</span>
              <ButtonStyleless
                className={!displayAll ? 'theme-color' : ''}
                onClick={this.changeDisplayOptions(false)}
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
        render: (checked) => {
          console.log('checked = ', checked);
          return (
            <Field
              component={FormCheckbox}
              name={`placements.${this.props.type}.${checked.index}.checked`}
              type="checkbox"
            />
          );
        },
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
    const { placements } = this.props;
    console.log('placements = ', placements.map(p => ({ name: p.name, checked: p.checked })));


    const sortPlacements = (checkedStatus) => {
      return placements.reduce((formattedPlacements, placement, index) => {
        // console.log('placement.checked = ', placement.checked);
        // console.log('checkedStatus = ', checkedStatus);
        return (placement.checked === checkedStatus
          ? [...formattedPlacements, { ...placement, index }]
          : formattedPlacements
        );
      }, []);

      // return sortBy(filteredPlacements, ['text']);
    };

    const selectedPlacements = sortPlacements(true);
    const unselectedPlacements = sortPlacements(false);

    console.log('selectedPlacements = ', selectedPlacements);
    console.log('unselectedPlacements = ', unselectedPlacements);


    const t = [...selectedPlacements, ...unselectedPlacements].map(elem => ({
      checked: { index: elem.index, name: elem.name, value: elem.checked },
      key: elem.id,
      name: { icon: elem.icon, text: elem.text },
    }));

    console.log('t = ', t);

    return t;
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

PlacementTable.defaultProps = {
  className: '',
  placements: [],
};


PlacementTable.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
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

export default connect(null, mapDispatchToProps)(PlacementTable);
