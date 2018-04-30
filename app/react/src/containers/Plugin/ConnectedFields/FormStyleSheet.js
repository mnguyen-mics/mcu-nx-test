import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tooltip, Row, Col, Button, Modal } from 'antd';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

import McsIcon from '../../../components/McsIcon.tsx';
import PluginService from '../../../services/PluginService.ts';

const Option = Select.Option;

const defaultTooltipPlacement = 'right';

class FormStyleSheet extends Component {
  state = {
    open: false,
    value: {
      id: '',
      version: '',
    },
    displayValues: {
      elementName: '',
      versionName: '',
    },
    styleSheets: [],
    versions: [],
    versionLoading: false,
  };

  componentDidMount() {
    const {
      options: { pluginVersionId, organisationId },
    } = this.props;

    this.getStylesheets(organisationId, pluginVersionId);
  }

  getStylesheets = organisationId => {
    const {
      options: { disabled },
    } = this.props;

    PluginService.getStyleSheets(organisationId).then(styleSheets => {
      this.setState(
        prevState => {
          const nextState = prevState;
          nextState.styleSheets = styleSheets.map(item => {
            return {
              key: item.id,
              disabled: disabled,
              value: item.id,
              name: item.name,
              title: `${item.name} (${item.id})`,
              text: `${item.name} (${item.id})`,
            };
          });
        },
        () => {
          if (styleSheets[0] && styleSheets[0].id) {
            this.getNewStyleSheetsVersion(organisationId, styleSheets[0].id);
          }
        },
      );
    });
  };

  getNewStyleSheetsVersion = styleSheetsId => {
    const {
      options: { disabled, organisationId },
    } = this.props;

    this.setState(
      prevState => {
        const nextState = prevState;
        nextState.versionLoading = true;
        return nextState;
      },
      () => {
        PluginService.getStyleSheetsVersion(organisationId, styleSheetsId).then(
          versions => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };

              nextState.versions = versions.map(item => {
                const title = `${item.description} ${
                  item.description ? '-' : ''
                } ${item.status} (${item.id})`;
                return {
                  key: item.id,
                  disabled: disabled,
                  value: item.id,
                  title: title,
                  text: title,
                };
              });
              nextState.versionLoading = false;
              return nextState;
            });
          },
        );
      },
    );
  };

  onChange = (type, value) => {
    this.setState(prevState => {
      const nextState = prevState;
      nextState.value[type] = value;
      return nextState;
    });
  };

  onModalConfirm = () => {
    const { input } = this.props;
    const { value, versions } = this.state;
    if (value.id === '') {
      this.setState(
        prevState => {
          const nextState = prevState;
          nextState.value.id = this.state.styleSheets[0].value;
        },
        () => {
          if (value.version === '') {
            this.setState(
              prevState => {
                const nextState = prevState;
                nextState.value.version = versions[0].value;
              },
              () => {
                input.onChange(value);
                this.setState(prevState => {
                  const nextState = prevState;
                  nextState.open = false;
                });
              },
            );
          }
        },
      );
    } else if (value.version === '') {
      this.setState(
        prevState => {
          const nextState = prevState;
          nextState.value.version = versions[0].value;
        },
        () => {
          input.onChange(value);
          this.setState(prevState => {
            const nextState = prevState;
            nextState.open = false;
          });
        },
      );
    } else {
      input.onChange(value);
      this.setState(prevState => {
        const nextState = prevState;
        nextState.open = false;
      });
    }
  };

  onModalClose = () => {
    this.setState(prevState => {
      const nextState = prevState;
      nextState.open = false;
    });
  };

  render() {
    const { meta, formItemProps, helpToolTipProps, input } = this.props;

    const { styleSheets, versions, versionLoading } = this.state;

    let validateStatus = '';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    return (
      styleSheets &&
      styleSheets.length && (
        <Form.Item
          help={meta.touched && (meta.warning || meta.error)}
          validateStatus={validateStatus}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10, offset: 1 }}
          {...formItemProps}
        >
          <Row align="middle" type="flex" className="m-b-20">
            <Col span={22}>
              {input.value &&
                input.value.id && (
                  <span className="m-r-10">
                    {
                      styleSheets.find(item => {
                        return item.value === input.value.id;
                      }).text
                    }{' '}
                    - {input.value.version}
                  </span>
                )}
              <Button
                onClick={() => {
                  this.setState({ open: true });
                }}
              >
                {input.value ? (
                  <FormattedMessage {...messages.styleSheetButtonChange} />
                ) : (
                  <FormattedMessage {...messages.styleSheetButtonChoose} />
                )}
              </Button>
              <Modal
                title={<FormattedMessage {...messages.styleSheetModalTitle} />}
                visible={this.state.open}
                onOk={() => {
                  this.onModalConfirm();
                }}
                onCancel={() => {
                  this.onModalClose();
                }}
              >
                {styleSheets &&
                  styleSheets.length && (
                    <span>
                      <FormattedMessage {...messages.styleSheetModalElement} />
                    </span>
                  )}
                {styleSheets &&
                  styleSheets.length && (
                    <Select
                      style={{ width: '100%' }}
                      defaultValue={styleSheets[0].value}
                      onChange={value => {
                        this.onChange('id', value);
                      }}
                      onSelect={this.getNewStyleSheetsVersion}
                    >
                      {styleSheets.map(
                        ({ disabled, value, key, title, text }) => (
                          <Option {...{ disabled, value, key, title }}>
                            {text}
                          </Option>
                        ),
                      )}
                    </Select>
                  )}

                {versions &&
                  versions.length &&
                  !versionLoading && (
                    <FormattedMessage {...messages.styleSheetModalVersions} />
                  )}
                {versions &&
                  versions.length &&
                  !versionLoading && (
                    <Select
                      style={{ width: '100%' }}
                      defaultValue={versions[0].value}
                      onChange={value => {
                        this.onChange('version', value);
                      }}
                    >
                      {versions.map(({ disabled, value, key, title, text }) => (
                        <Option {...{ disabled, value, key, title }}>
                          {text}
                        </Option>
                      ))}
                    </Select>
                  )}
              </Modal>
            </Col>

            {displayHelpToolTip && (
              <Col span={2} className="field-tooltip">
                <Tooltip {...mergedTooltipProps}>
                  <McsIcon type="info" />
                </Tooltip>
              </Col>
            )}
          </Row>
        </Form.Item>
      )
    );
  }
}

FormStyleSheet.defaultProps = {
  formItemProps: {},
  selectProps: {},
  options: [],
  helpToolTipProps: {},
};

FormStyleSheet.propTypes = {
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

export default FormStyleSheet;
