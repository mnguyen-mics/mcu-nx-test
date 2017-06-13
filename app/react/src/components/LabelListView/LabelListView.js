import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Row, Col, Tag, Icon, Tooltip, Button, Input, Menu, Dropdown, AutoComplete } from 'antd';
import { FormattedMessage } from 'react-intl';


class LabelListView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inputVisible: false,
      inputValue: '',
      data: this.props.listItems.map(item => {
        const filter = {
          value: item.id,
          text: item.name
        };
        return filter;
      })
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => { this.inputElement.focus(); });
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  }

  handleInputBlur = () => {
    this.setState({
      inputVisible: false
    });
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    if (inputValue !== '') {
      this.props.onInputSubmit(inputValue);
    }

    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  }

  buildFilterItems() {

    const {
      filters,
      translations
    } = this.props;

    const items = [];

    Object.keys(filters).forEach(filter => {
      return filters[filter].data.forEach(value => {
        items.push({
          id: value,
          type: filter,
          value: translations[value],
          isClosable: filters[filter].closable
        });
      });
    });

    return items;

  }

  handleMenuClick = (e) => {
    this.setState({
      inputVisible: false
    });
    this.props.onInputSubmit(e.key, true);
  }

  handleClick = (e) => {
    console.log(this.inputElement);
    this.inputElement.focus(e);
  };

  handleSearch = (value) => {
    this.setState({
      data: this.setData(value)
    });
  }

  setData = (value) => {
    if (value) {
      return this.state.data.filter(element => {
        return element.text.indexOf(value) > -1;
      });
    }

    return this.props.listItems.map(item => {
      const filter = {
        value: item.id,
        text: item.name
      };
      return filter;
    });

  }

  render() {

    const {
      isInputVisible,
      onClickOnClose,
      label,
      className,
      listItems,
      filters
    } = this.props;

    const items = filters;

    const selectedTags = listItems.map(item => {
      const filter = {
        value: item.id,
        text: item.name
      };
      return filter;
    });

    const { inputVisible, inputValue } = this.state;

    const onClickCloseTag = (tag) => {
      return onClickOnClose(tag);
    };

    const displayContent = (item) => {
      return item.icon ? (<span><Icon type={item.icon} /> {item.name}</span>) : (<span>{item.name}</span>);
    };


    const generateTag = (item) => {
      const isLongTag = item.name.length > 20;
      const tagElem = (<Tag closable key={item.id} afterClose={() => { onClickCloseTag(item); }} >{ displayContent(item) }</Tag>);
      return isLongTag ? <Tooltip title={item.name}>{tagElem}</Tooltip> : tagElem;

    };

    return (
      <Row className={className} >
        { label && (
          <Col className="mcs-label-list-view-label" span={24}>
            <FormattedMessage id={label} />
          </Col>)}
        <Col span={24}>
          {items.map((tag) => {
            return generateTag(tag);
          })}
          {isInputVisible && inputVisible && (
          <AutoComplete
            dataSource={selectedTags}
            onChange={this.handleSearch}
            placeholder="website"
            style={{ width: 200 }}
          >
            <Input size="small" />
          </AutoComplete>
        )}
          {isInputVisible && !inputVisible && (
            <Button size="small" type="dashed" onClick={e => { this.showInput(e); this.handleClick(e); }}>Add New Tag</Button>
          )}
        </Col>
      </Row>
    );
  }
}


LabelListView.defaultProps = {
  onInputSubmit: () => {},
  label: '',
  isInputVisible: false,
  className: ''
};

LabelListView.propTypes = {
  label: PropTypes.string,
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isInputVisible: PropTypes.bool,
  onClickOnClose: PropTypes.func.isRequired,
  onInputSubmit: PropTypes.func,
  className: PropTypes.string,
  listItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations
});

const mapDispatchToProps = {};

LabelListView = connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelListView);
/*
* EXAMPLE :
<LabelListView filters={filters} label="Filtered by:" onClickOnClose={returnFunc} isInputVisible onInputSubmit={returnFunc} />
*/


export default LabelListView;
