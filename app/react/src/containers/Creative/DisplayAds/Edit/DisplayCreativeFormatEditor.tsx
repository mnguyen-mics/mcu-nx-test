import * as React from 'react';
import { compose } from 'recompose';
import { Input, Select } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { WrappedFieldProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';
import FormFieldWrapper from '../../../../components/Form/FormFieldWrapper';
import { Button } from '@mediarithmics-private/mcs-components-library';
import messages from '../Edit/messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ICreativeService } from '../../../../services/CreativeService';

const Option = Select.Option;

export interface CreativeFormatEditorProps extends WrappedFieldProps {
  disabled?: boolean;
  small?: boolean;
}

type JoinedProps = CreativeFormatEditorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  availableFormats: string[];
  standardFormat: boolean;
}

class DisplayCreativeFormatEditor extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      availableFormats: [],
      standardFormat: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      input,
    } = this.props;
    this._creativeService
      .getCreativeFormats(organisationId, {
        type: 'DISPLAY_AD',
      })
      .then(res => {
        const formats = res.data
          .sort((a, b) => {
            return a.width - b.width;
          })
          .map(adFormat => `${adFormat.width}x${adFormat.height}`);
        this.setState({ availableFormats: formats });
        if (!input.value) {
          input.onChange(formats[0]);
        }
      });
  }

  render() {
    const {
      intl: { formatMessage },
      input,
      meta,
      disabled,
      small,
    } = this.props;
    const { standardFormat, availableFormats } = this.state;

    let validateStatus: 'error' | 'success' | 'warning' | 'validating' = 'success';
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

    const onDimensionChange = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const isDimension = !value || (/^\d+$/i.test(value) && value.length < 15);

      if (isDimension) {
        input.onChange(type === 'width' ? `${value}x${height}` : `${width}x${value}`);
      }
    };

    const handleOnBlur = () => () => input.onBlur(input.value);

    return (
      <FormFieldWrapper
        helpToolTipProps={{
          title: formatMessage(messages.creativeCreationGeneralFormatFieldHelper),
        }}
        label={formatMessage(messages.creativeCreationGeneralFormatFieldTitle)}
        required={true}
        validateStatus={validateStatus}
        small={small}
      >
        <div className='creative-format'>
          <div className='field'>
            {standardFormat ? (
              <Select
                onBlur={handleOnBlur}
                onChange={input.onChange}
                onFocus={input.onFocus}
                value={input.value}
                disabled={disabled}
              >
                {availableFormats.map(option => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            ) : (
              <div className='custom'>
                <div className='input'>
                  <Input value={width} onChange={onDimensionChange('width')} disabled={disabled} />
                </div>
                <div className='separator'>x</div>
                <div className='input'>
                  <Input
                    value={height}
                    onChange={onDimensionChange('height')}
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
          </div>

          <div className='button'>
            <Button className='clickable-on-hover' onClick={buttonOnClick}>
              {buttonLabel}
            </Button>
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
