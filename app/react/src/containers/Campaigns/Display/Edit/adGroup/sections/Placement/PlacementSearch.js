import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Avatar, Icon, Input, Table } from 'antd';

import { Form } from '../../../../../../../components';
import { toLowerCaseNoAccent } from '../../../../../../../utils/StringHelper';
import messages from '../../../messages';

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
    this.props.updateDisplayOptions(false)(e);
    e.preventDefault();
  }

  updateSearch = (e) => {
    this.setState({
      keyword: (e && e.target.value ? toLowerCaseNoAccent(e.target.value) : '')
    });
  }

  render() {
    const { className, displaySearchOptions, emptyTableMessage, formatMessage, updateDisplayOptions } = this.props;
    const { keyword } = this.state;

    const suffix = (displaySearchOptions ? <Icon type="close-circle" onClick={this.onClose} /> : null);

    return (
      <div>
        <Input
          size="large"
          className="search-input"
          placeholder={formatMessage(messages.contentSection9SearchPlaceholder)}
          prefix={<Icon type="search" />}
          suffix={suffix}
          value={keyword}
          onChange={this.updateSearch}
          onFocus={updateDisplayOptions(true)}
        />

        <Table
          className={`${className} remove-margin-between-search-and-table ${displaySearchOptions ? '' : 'table-without-empty-message'}`}
          columns={this.buildColumns()}
          dataSource={this.buildDataSource()}
          locale={{ emptyText: (displaySearchOptions ? emptyTableMessage : '') }}
          pagination={false}
          showHeader={false}
          scroll={{ y: 265 }}
        />
      </div>
    );
  }
}

PlacementSearch.defaultProps = {
  className: '',
  placements: [],
};

PlacementSearch.propTypes = {
  className: PropTypes.string,
  displaySearchOptions: PropTypes.bool.isRequired,
  emptyTableMessage: PropTypes.string.isRequired,
  formatMessage: PropTypes.func.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),

  updateDisplayOptions: PropTypes.func.isRequired,
};

export default PlacementSearch;
