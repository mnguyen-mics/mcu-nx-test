import React, { Component, PropTypes } from 'react';
import { Row, Col, Tag, Icon, Tooltip, Button, Input } from 'antd';

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


  render() {

    const {
      items,
      isInputVisible,
      onClickOnClose,
      label
    } = this.props;

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
      <Row>
        { label && (
          <Col span={24}>
            { label }
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

/*
* EXAMPLE :
<LabelListView items={items} label="Filtered by:" onClickOnClose={returnFunc} isInputVisible onInputSubmit={returnFunc} />
*/


export default LabelListView;
