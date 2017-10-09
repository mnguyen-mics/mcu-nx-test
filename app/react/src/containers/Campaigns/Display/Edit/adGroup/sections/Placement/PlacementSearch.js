import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Avatar, Table } from 'antd';

import { ButtonStyleless, Form, McsIcons } from '../../../../../../../components';
import { toLowerCaseNoAccent } from '../../../../../../../utils/StringHelper';
import messages from '../../../messages';

const { FormCheckbox } = Form;

class PlacementSearch extends Component {

  state = { keyword: '' }

  buildColumns = () => {
    const { formatMessage, updateDisplayOptions } = this.props;
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
            placeholder={formatMessage(messages.contentSection9SearchPlaceholder)}
            onChange={this.updateSearch}
            onFocus={updateDisplayOptions(true)}
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
    this.props.updateDisplayOptions(false)(e);
    e.preventDefault();
  }

  updateSearch = (e) => {
    this.setState({
      keyword: (e && e.target.value ? toLowerCaseNoAccent(e.target.value) : '')
    });
  }

  render() {
    const { className, displaySearchOptions, emptyTableMessage } = this.props;

    return (
      <div className={displaySearchOptions ? '' : 'table-without-empty-message'}>
        <Table
          className={className}
          columns={this.buildColumns()}
          dataSource={this.buildDataSource()}
          locale={{ emptyText: (displaySearchOptions ? emptyTableMessage : '') }}
          pagination={false}
          showHeader
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
