import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, Button, Modal } from 'antd';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';
import FormFieldWrapper from '../../../components/Form/FormFieldWrapper.tsx';
import PluginService from '../../../services/PluginService.ts';

const Option = Select.Option;

const defaultTooltipPlacement = 'right';

class FormAdLayout extends Component {
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
    adLayouts: [],
    versions: [],
    versionLoading: false,
  };

  componentDidMount() {
    const {
      options: { pluginVersionId, organisationId },
    } = this.props;

    this.getAdLayout(organisationId, pluginVersionId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      options: { pluginVersionId, organisationId },
    } = this.props;

    const {
      options: {
        pluginVersionId: nextPluginVersionId,
        organisationId: nextOrganisationId,
      },
    } = nextProps;

    if (
      pluginVersionId !== nextPluginVersionId ||
      organisationId !== nextOrganisationId
    ) {
      this.getAdLayout(nextOrganisationId, nextPluginVersionId);
    }
  }

  getAdLayout = (organisationId, rendererVersion) => {
    const {
      options: { disabled },
    } = this.props;

    PluginService.getAdLayouts(organisationId, rendererVersion).then(
      adLayouts => {
        this.setState(
          prevState => {
            const nextState = prevState;
            nextState.adLayouts = adLayouts.map(item => {
              return {
                key: item.id,
                disabled: disabled,
                value: item.id,
                name: item.name,
                title: `${item.name} (${item.id})`,
                text: `${item.name} (${item.id})`,
              };
            });
            return nextState;
          },
          () => {
            if (adLayouts[0] && adLayouts[0].id) {
              this.getNewAdlayoutVersion(organisationId, adLayouts[0].id);
            }
          },
        );
      },
    );
  };

  getNewAdlayoutVersion = adLayoutId => {
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
        PluginService.getAdLayoutVersion(organisationId, adLayoutId).then(
          versions => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.versions = versions.map(item => {
                const title = `${item.filename} ${item.filename ? '-' : ''} ${
                  item.status
                } (${item.id})`;
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

  onModalClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { meta, formItemProps, helpToolTipProps, input } = this.props;

    const { adLayouts, open, versions, versionLoading } = this.state;

    let validateStatus = '';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    const label =
      input.value &&
      input.value.id &&
      adLayouts.find(item => {
        return item.value === input.value.id;
      }).text;

    const children = (
      <div>
        <Button
          onClick={() => {
            this.setState({ open: true });
          }}
        >
          {input.value && input.value.id ? (
            <FormattedMessage {...messages.adLayoutButtonChange} />
          ) : (
            <FormattedMessage {...messages.adLayoutButtonChoose} />
          )}
        </Button>
        <Modal
          title={<FormattedMessage {...messages.adLayoutModalTitle} />}
          visible={open}
          onOk={this.onModalClose}
          confirmLoading={versionLoading}
          onCancel={this.onModalClose}
        >
          {adLayouts && adLayouts.length ? (
            <FormattedMessage {...messages.adLayoutModalElement} />
          ) : null}
          {adLayouts && adLayouts.length ? (
            <Select
              style={{ width: '100%' }}
              onChange={value => {
                this.onChange('id', value);
              }}
              onSelect={this.getNewAdlayoutVersion}
            >
              {adLayouts.map(({ disabled, value, key, title, text }) => (
                <Option {...{ disabled, value, key, title }}>{text}</Option>
              ))}
            </Select>
          ) : null}
          {versions && versions.length && !versionLoading ? (
            <FormattedMessage {...messages.adLayoutModalLabel} />
          ) : null}
          {versions && versions.length && !versionLoading ? (
            <Select
              style={{ width: '100%' }}
              onChange={value => {
                this.onChange('version', value);
              }}
            >
              {versions.map(({ disabled, value, key, title, text }) => (
                <Option {...{ disabled, value, key, title }}>{text}</Option>
              ))}
            </Select>
          ) : null}
        </Modal>
      </div>
    );

    return adLayouts && adLayouts.length ? (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={displayHelpToolTip ? mergedTooltipProps : undefined}
        validateStatus={validateStatus}
        label={label}
        {...formItemProps}
      >
        {children}
      </FormFieldWrapper>
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
