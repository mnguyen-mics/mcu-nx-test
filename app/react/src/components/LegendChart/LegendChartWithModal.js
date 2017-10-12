import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Row, Col, Radio } from 'antd';
import McsIcons from '../McsIcons.tsx';

class LegendChartWithModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      key1: '',
      key2: '',
    };
  }

  render() {
    const { options } = this.props;
    const renderPicker = (that) => {
      const { legends } = this.props;
      const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      };

      that.setState({
        key1: options[0].key,
        key2: options[1].key,
      });

      const onChangeValueLeft = e => {
        that.setState({ key1: e.target.value });
      };
      const onChangeValueRight = e => {
        that.setState({ key2: e.target.value });
      };

      return (
        <Row>
          <Col span={12}>
            <Radio.Group
              defaultValue={options[0].key}
              onChange={e => {
                onChangeValueLeft(e, 0);
              }}
            >
              {legends.map(legend => {
                return (
                  <Radio key={legend.key} style={radioStyle} value={legend.key}>
                    {legend.domain}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Col>
          <Col span={12}>
            <Radio.Group
              defaultValue={options[1].key}
              onChange={e => onChangeValueRight(e, 1)}
            >
              {legends.map(legend => {
                return (
                  <Radio key={legend.key} style={radioStyle} value={legend.key}>
                    {legend.domain}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Col>
        </Row>
      );
    };

    const renderModal = (that) => {
      const { onLegendChange } = this.props;
      Modal.confirm({
        title: 'Do you Want to delete these items?',
        content: renderPicker(that),
        onOk() {
          onLegendChange(that.state.key1, that.state.key2);
        },
        onCancel() {
        },
      });
    };

    return (
      <div className="mcs-legend-container">
        {options.map(option => {
          return (
            <div key={option.domain} style={{ float: 'left' }}>
              <div
                style={{
                  backgroundColor: option.color,
                  marginLeft: '10px',
                  width: '30px',
                  height: '4px',
                  borderRadius: '5px',
                  marginTop: '18px',
                  float: 'left',
                }}
              />
              <span
                style={{
                  float: 'right',
                  lineHeight: '40px',
                  marginLeft: '5px',
                }}
              >{option.domain}</span>
            </div>
          );
        })}
        <div
          style={{
            float: 'left',
            marginLeft: '10px',
            borderLeft: '1px solid #f0f0f0',
            height: '40px',
            lineHeight: '40px',
          }}
        >
          <button
            className="mcs-invisible-button"
            onClick={() => {
              renderModal(this);
            }}
          >
            <McsIcons
              style={{ marginLeft: '10px', color: '#d0d0d0' }}
              type="pen"
            />
          </button>
        </div>
      </div>
    );
  }
}

LegendChartWithModal.defaultProps = {
  legends: [],
  onLegendChange: () => {},
};

LegendChartWithModal.propTypes = {
  legends: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      domain: PropTypes.string.isRequired,
    }),
  ),
  onLegendChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      keys: PropTypes.arrayOf(PropTypes.string),
      colors: PropTypes.arrayOf(PropTypes.string),
      domains: PropTypes.arrayOf(PropTypes.string),
    }),
  ).isRequired,
};

export default LegendChartWithModal;
