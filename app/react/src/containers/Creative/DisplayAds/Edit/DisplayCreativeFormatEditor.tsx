import * as React from 'react';
import { compose } from 'recompose';
import { Input, Select } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { WrappedFieldProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';

import FormFieldWrapper from '../../../../components/Form/FormFieldWrapper';
import ButtonStyleless from '../../../../components/ButtonStyleless';
import FormSelect from '../../../../components/Form/FormSelect/FormSelect';
import CreativeService from '../../../../services/CreativeService';
import messages from '../Edit/messages';

const Option = Select.Option;

export interface CreativeFormatEditorProps extends WrappedFieldProps {
  disabled?: boolean;
}

type JoinedProps = CreativeFormatEditorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  availableFormats: string[];
  standardFormat: boolean;
}

class DisplayCreativeFormatEditor extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      availableFormats: [],
      standardFormat: true,
    };
  }

  componentDidMount() {
    const { match: { params: { organisationId } } } = this.props;
    CreativeService.getCreativeFormats(organisationId, { type: 'DISPLAY_AD' }).then(res => {
      const formats = res.data
        .sort((a, b) => {
          return a.width - b.width;
        })
        .map(
        adFormat => `${adFormat.width}x${adFormat.height}`,
      );
      this.setState({ availableFormats: formats });
    });
  }

  render() {
    const { intl: { formatMessage }, input, meta, disabled } = this.props;
    const { standardFormat, availableFormats } = this.state;

    let validateStatus: 'error' | 'success' | 'warning' | 'validating' =
      'success';
    if (meta.invalid) validateStatus = 'error';
    if (meta.warning) validateStatus = 'warning';

    const buttonLabel = formatMessage(
      messages[
      standardFormat
        ? 'creativeCreationGeneralFormatFieldButtonCustom'
        : 'creativeCreationGeneralFormatFieldButtonStandard'
      ],
    );

    const buttonOnClick = () => {
      this.setState({ standardFormat: !standardFormat });
    };

    /* For custom format only */
    const dimensions = input.value ? input.value.split('x') : '';
    const width = dimensions[0] ? dimensions[0] : '';
    const height = dimensions[1] ? dimensions[1] : '';

    const onDimensionChange = (type: string) => (
      e: React.FormEvent<HTMLButtonElement>,
    ) => {
      // const { value } = e.target;
      const isDimension =
        !input.value || (/^\d+$/i.test(input.value) && input.value.length < 15);

      if (isDimension) {
        input.onChange(
          type === 'width'
            ? `${input.value}x${height}`
            : `${width}x${input.value}`,
        );
      }
    };

    return (
      <FormFieldWrapper
        helpToolTipProps={{
          title: formatMessage(
            messages.creativeCreationGeneralFormatFieldHelper,
          ),
        }}
        label={formatMessage(messages.creativeCreationGeneralFormatFieldTitle)}
        required={true}
        validateStatus={validateStatus}
      >
        <div className="creative-format">
          <div className="field">
            {standardFormat ? (
              <FormSelect 
                onBlur={input.onBlur as () => any}
                onChange={input.onChange as () => any}
                onFocus={input.onFocus as () => any}
                value={input.value} 
                disabled={disabled}>
                
                {availableFormats.map(option => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}

              </FormSelect>
            ) : (
                <div className="custom">
                  <div className="input">
                    <Input
                      value={width}
                      onChange={onDimensionChange('width')}
                      disabled={disabled}
                    />
                  </div>
                  <div className="separator">x</div>
                  <div className="input">
                    <Input
                      value={height}
                      onChange={onDimensionChange('height')}
                      disabled={disabled}
                    />
                  </div>
                </div>
              )}
          </div>

          <div className="button">
            <ButtonStyleless
              className="clickable-on-hover"
              onClick={buttonOnClick}
            >
              {buttonLabel}
            </ButtonStyleless>
          </div>
        </div>
      </FormFieldWrapper>
    );
  }
}

export default compose<JoinedProps, CreativeFormatEditorProps>(
  injectIntl,
  withRouter,
)(DisplayCreativeFormatEditor);
