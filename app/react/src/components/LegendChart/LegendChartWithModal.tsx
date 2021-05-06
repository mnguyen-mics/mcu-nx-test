import * as React from 'react';
import { Modal, Row, Col, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

interface Legend {
  key: string;
  domain: string;
}

interface LegendOption {
  key: string;
  color: string;
  domain: string;
}

interface LegendChartWithModalProps {
  identifier: string;
  options: LegendOption[];
  legends: Legend[];
  onLegendChange: (a: string, b: string) => void;
}

interface LegendChartWithModalState {
  key1: string;
  key2: string;
}

class LegendChartWithModal extends React.Component<
  LegendChartWithModalProps,
  LegendChartWithModalState
> {
  constructor(props: LegendChartWithModalProps) {
    super(props);

    this.state = {
      key1: '',
      key2: '',
    };
  }

  render() {
    const { options } = this.props;
    const renderPicker = () => {
      const { legends } = this.props;
      const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      };

      this.setState({
        key1: options[0].key,
        key2: options[1].key,
      });

      const onChangeValueLeft = (e: RadioChangeEvent) => {
        this.setState((oldState: LegendChartWithModalState) => {
          return {
            ...oldState,
            key1: e.target.value,
          };
        });
      };
      const onChangeValueRight = (e: RadioChangeEvent) => {
        this.setState((oldState: LegendChartWithModalState) => {
          return {
            ...oldState,
            key2: e.target.value,
          };
        });
      };

      return (
        <Row>
          <Col span={12}>
            <Radio.Group defaultValue={options[0].key} onChange={onChangeValueLeft}>
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
            <Radio.Group defaultValue={options[1].key} onChange={onChangeValueRight}>
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

    const renderModal = (that: LegendChartWithModal) => {
      const { onLegendChange } = this.props;
      Modal.confirm({
        title: 'Do you Want to delete these items?',
        content: renderPicker(),
        onOk() {
          onLegendChange(that.state.key1, that.state.key2);
        },
        onCancel() {
          return;
        },
      });
    };

    const onClick = () => renderModal(this);
    return (
      <div className='mcs-legend-container'>
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
              >
                {option.domain}
              </span>
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
          <button className='mcs-invisible-button' onClick={onClick}>
            <McsIcon style={{ marginLeft: '10px', color: '#d0d0d0' }} type='pen' />
          </button>
        </div>
      </div>
    );
  }
}

export default LegendChartWithModal;
