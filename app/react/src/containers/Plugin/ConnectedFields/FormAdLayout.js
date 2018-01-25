import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tooltip, Row, Col, Button, Modal } from 'antd';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

import McsIcons from '../../../components/McsIcons.tsx';
import PluginService from '../../../services/PluginService.ts';


const Option = Select.Option;

const defaultTooltipPlacement = 'right';

class FormAdLayout extends Component {

  state= {
    open: false,
    value: {
      id: '',
      version: ''
    },
    displayValues: {
      elementName: '',
      versionName: ''
    },
    adLayouts: [],
    versions: [],
    versionLoading: false,
  }

  componentDidMount() {
    const {
      options: {
        pluginVersionId,
        organisationId,
      },
    } = this.props;

    this.getAdLayout(organisationId, pluginVersionId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      options: {
        pluginVersionId,
        organisationId,
      },
    } = this.props;

    const {
      options: {
        pluginVersionId: nextPluginVersionId,
        organisationId: nextOrganisationId,
      },
    } = nextProps;

    if (pluginVersionId !== nextPluginVersionId || organisationId !== nextOrganisationId) {
      this.getAdLayout(nextOrganisationId, nextPluginVersionId);
    }
  }


  getAdLayout = (organisationId, rendererVersion) => {
    const {
      options: {
        disabled
      }
    } = this.props;

    PluginService.getAdLayouts(organisationId, rendererVersion).then(adLayouts => {
      this.setState(prevState => {
        const nextState = prevState;
        nextState.adLayouts = adLayouts.map(item => {
          return { key: item.id, disabled: disabled, value: item.id, name: item.name, title: `${item.name} (${item.id})`, text: `${item.name} (${item.id})` };
        });
      }, () => {
        this.getNewAdlayoutVersion(organisationId, adLayouts[0].id);
      });
    });
  }

  getNewAdlayoutVersion = (adLayoutId) => {
    const {
      options: {
        disabled,
        organisationId
      }
    } = this.props;

    this.setState(prevState => {
      const nextState = prevState;
      nextState.versionLoading = true;
      return nextState;
    }, () => {
      PluginService.getAdLayoutVersion(organisationId, adLayoutId).then(versions => {
        this.setState(prevState => {
          const nextState = {
            ...prevState
          };
          nextState.versions = versions.map(item => {
            const title = `${item.filename} ${item.filename ? '-' : ''} ${item.status} (${item.id})`;
            return { key: item.id, disabled: disabled, value: item.id, title: title, text: title };
          });
          nextState.versionLoading = false;
          return nextState;
        });
      });
    });
  }


  onChange = (type, value) => {
    this.setState(prevState => {
      const nextState = prevState;
      nextState.value[type] = value;
      return nextState;
    });
  }

  onModalConfirm = () => {
    const { input } = this.props;

    if (this.state.value.id === '') {
      this.setState(prevState => {
        const nextState = prevState;
        nextState.value.id = this.state.adLayouts[0].value;
      }, () => {
        if (this.state.value.version === '') {
          this.setState(prevState => {
            const nextState = prevState;
            nextState.value.version = this.state.versions[0].value;
          }, () => {
            input.onChange(this.state.value);
            this.setState(prevState => {
              const nextState = prevState;
              nextState.open = false;
            });
          });
        }
      });
    } else if (this.state.value.version === '') {
      this.setState(prevState => {
        const nextState = prevState;
        nextState.value.version = this.state.versions[0].value;
      }, () => {
        input.onChange(this.state.value);
        this.setState(prevState => {
          const nextState = prevState;
          nextState.open = false;
        });
      });
    } else {
      input.onChange(this.state.value);
      this.setState(prevState => {
        const nextState = prevState;
        nextState.open = false;
      });
    }


  }

  onModalClose = () => {
    this.setState(prevState => {
      const nextState = prevState;
      nextState.open = false;
    });
  }

  render() {
    const {
      meta,
      formItemProps,
      helpToolTipProps,
      input,
    } = this.props;

    let validateStatus = '';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    return ((this.state.adLayouts && this.state.adLayouts.length)) ? (
      <Form.Item
        help={meta.touched && (meta.warning || meta.error)}
        validateStatus={validateStatus}
        {...formItemProps}
      >

        <Row align="middle" type="flex" className="m-b-20">
          <Col span={22}>
            { input.value && input.value.id !== null ? <span className="m-r-10">{this.state.adLayouts.find(item => { return item.value === input.value.id; }).text} - {input.value.version}</span> : null }
            <Button onClick={() => { this.setState({ open: true }); }}>{input.value ? <FormattedMessage {...messages.adLayoutButtonChange} /> : <FormattedMessage {...messages.adLayoutButtonChoose} />}</Button>
            <Modal
              title={<FormattedMessage {...messages.adLayoutModalTitle} />}
              visible={this.state.open}
              onOk={() => { this.onModalConfirm(); }}
              onCancel={() => { this.onModalClose(); }}
            >
              {(this.state.adLayouts && this.state.adLayouts.length) && (<span><FormattedMessage {...messages.adLayoutModalElement} /></span>)}
              {(this.state.adLayouts && this.state.adLayouts.length) && (
                <Select style={{ width: '100%' }} defaultValue={this.state.adLayouts[0].value} onChange={(value) => { this.onChange('id', value); }} onSelect={this.getNewAdlayoutVersion}>
                  {this.state.adLayouts.map(({ disabled, value, key, title, text }) => (
                    <Option {...{ disabled, value, key, title }}>{text}</Option>
                ))}
                </Select>)}

              {(this.state.versions && this.state.versions.length && !this.state.versionLoading) ? (<span><FormattedMessage {...messages.adLayoutModalLabel} /></span>) : null}
              {(this.state.versions && this.state.versions.length && !this.state.versionLoading) ? (
                <Select style={{ width: '100%' }} defaultValue={this.state.versions[0].value} onChange={(value) => { this.onChange('version', value); }}>
                  {this.state.versions.map(({ disabled, value, key, title, text }) => (
                    <Option {...{ disabled, value, key, title }}>{text}</Option>
                ))}
                </Select>) : null}
            </Modal>
          </Col>

          {displayHelpToolTip &&
            <Col span={2} className="field-tooltip">
              <Tooltip {...mergedTooltipProps}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>}
        </Row>
      </Form.Item>
    ) : null;
  }


}

FormAdLayout.defaultProps = {
  formItemProps: {},
  selectProps: {},
  options: [],
  helpToolTipProps: {},
};

FormAdLayout.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    colon: PropTypes.bool,
  }),
  options: PropTypes.shape({
    disabled: PropTypes.bool.isRequired,
    pluginVersionId: PropTypes.string.isRequired,
    organisationId: PropTypes.string.isRequired,
  }).isRequired,
  helpToolTipProps: PropTypes.shape({
    tile: PropTypes.string,
    placement: PropTypes.oneOf([
      'top',
      'left',
      'right',
      'bottom',
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
      'leftTop',
      'leftBottom',
      'rightTop',
      'rightBottom',
    ]),
  }),
};

export default FormAdLayout;
