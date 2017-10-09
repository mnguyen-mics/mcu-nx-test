import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { arrayInsert, arrayRemove, Field } from 'redux-form';
import { Avatar, Table } from 'antd';

import { ButtonStyleless, Form, McsIcons } from '../../../../../../../components';
import { toLowerCaseNoAccent } from '../../../../../../../utils/StringHelper';

const { FormCheckbox } = Form;

class PlacementSearch extends Component {

  state = { keyword: '' }

  buildColumns = () => {
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
            placeholder={this.props.placeholder}
            onChange={this.updateSearch}
            onFocus={this.props.setDisplaySearchOptions(true)}
            value={this.state.keyword}
          />
        ),
        width: '95%',
      },
      {
        dataIndex: 'checked',
        key: 'checked',
        render: (checked) => (
          <Field
            component={FormCheckbox}
            name={`placements.${checked.type}.${checked.index}.checked`}
            type="checkbox"
          />
        ),
        title: (this.props.displaySearchOptions
          ? (
            <div className="title-wrapper">
              <ButtonStyleless onClick={this.onClose}>
                <McsIcons type="close" className="button" />
              </ButtonStyleless>
            </div>
          )
          : <div />
        ),
        width: '5%',
      },
    ];
  }

  buildDataSource = () => {
    const { displaySearchOptions, placements } = this.props;

    return (displaySearchOptions
      ? placements
        .map(elem => ({
          checked: { index: elem.index, type: elem.type },
          key: elem.id,
          name: { icon: elem.icon, text: elem.text, type: elem.type, },
        }))
        .filter(elem => toLowerCaseNoAccent(elem.name.text).includes(this.state.keyword))
      : []
    );
  };

  onClose = (e) => {
    this.updateSearch();
    this.props.setDisplaySearchOptions(false)(e);
    e.preventDefault();
  }

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
    this.setState({
      keyword: (e && e.target.value ? toLowerCaseNoAccent(e.target.value) : '')
    });
  }

  render() {
    const { className, displaySearchOptions, emptyTableMessage } = this.props;

    return (
      <Table
        locale={{ emptyText: (displaySearchOptions ? emptyTableMessage : '') }}
        className={className}
        columns={this.buildColumns()}
        dataSource={this.buildDataSource()}
        pagination={false}
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
  displaySearchOptions: PropTypes.bool.isRequired,
  emptyTableMessage: PropTypes.string.isRequired,
  formName: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),

  setDisplaySearchOptions: PropTypes.func.isRequired,
};

const mapDispatchToProps = { arrayInsert, arrayRemove };

export default connect(null, mapDispatchToProps)(PlacementSearch);
