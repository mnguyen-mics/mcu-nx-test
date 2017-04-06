import React, { Component, PropTypes } from 'react';
import { Row, Col, Tag, Icon, Tooltip, Button, Input } from 'antd';

class LabelListView extends Component {
  state = {
    inputVisible: false,
    inputValue: '',
  };

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
    const state = this.state;
    const inputValue = state.inputValue;
    // send to main component
    if (inputValue !== '') {
      this.props.onInputSubmit(inputValue);
    }

    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  }


  render() {

    const {
      items,
      isInputVisible
    } = this.props;

    const { inputVisible, inputValue } = this.state;

    const onClickCloseTag = (tag) => {
      return this.props.onClickOnClose(tag);
    };

    const displayContent = (item) => {
      if (item.icon) {
        return (<span><Icon type={item.icon} /> {item.value}</span>);
      }
      return (<span>{item.value}</span>);
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
      <Row>
        {this.props.label && (
          <Col span={24}>
            { this.props.label }
          </Col>)}
        <Col span={24}>
          {items.map((tag) => {
            return generateTag(tag);
          })}
          {isInputVisible && inputVisible && (
          <Input
            ref={(input) => { this.textInput = input; }}
            type="text" size="small"
            style={{ width: 78 }}
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
  isInputVisible: false
};

LabelListView.propTypes = {
  label: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.any.isRequired,
    value: PropTypes.string.isRequired,
    isClosable: PropTypes.bool.isRequired,
    icon: PropTypes.string,
  })).isRequired,
  isInputVisible: PropTypes.bool,
  onClickOnClose: PropTypes.func.isRequired,
  onInputSubmit: PropTypes.func,
};

export default LabelListView;
