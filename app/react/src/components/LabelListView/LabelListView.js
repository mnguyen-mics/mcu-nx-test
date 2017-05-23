import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Tag, Icon, Tooltip, Button, Input } from 'antd';
import { FormattedMessage } from 'react-intl';

class LabelListView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inputVisible: false,
      inputValue: '',
    };
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.textInput.focus());
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
          key: value,
          type: filter,
          value: translations[value],
          isClosable: filters[filter].closable
        });
      });
    });

    return items;

  }


  render() {

    const {
      isInputVisible,
      onClickOnClose,
      label,
      className
    } = this.props;

    const items = this.buildFilterItems();

    const { inputVisible, inputValue } = this.state;

    const onClickCloseTag = (tag) => {
      return onClickOnClose(tag);
    };

    const displayContent = (item) => {
      return item.icon ? (<span><Icon type={item.icon} /> {item.value}</span>) : (<span>{item.value}</span>);
    };


    const generateTag = (item) => {
      const isLongTag = item.value.length > 20;
      if (item.isClosable === true) {
        const tagElem = (<Tag closable key={item.key} afterClose={() => { onClickCloseTag(item); }} >{ displayContent(item) }</Tag>);
        return isLongTag ? <Tooltip title={item.value}>{tagElem}</Tooltip> : tagElem;
      }
      const tagElem = (<Tag key={item.key} >{ displayContent(item) }</Tag>);
      return isLongTag ? <Tooltip title={item.value}>{tagElem}</Tooltip> : tagElem;
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
          <Input
            ref={(input) => { this.textInput = input; }}
            type="text" size="small"
            className="mcs-input-label"
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputBlur}
            onPressEnter={this.handleInputConfirm}
          />
        )}
          {isInputVisible && !inputVisible && (
            <Button size="small" type="dashed" onClick={this.showInput}>Add New Tag</Button>
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
  className: PropTypes.string
};

const mapStateToProps = state => ({
  translations: state.translations
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
