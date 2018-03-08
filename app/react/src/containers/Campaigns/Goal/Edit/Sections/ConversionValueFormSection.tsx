import * as React from 'react';
import { Row, Col } from 'antd/lib/grid';
import { compose } from 'recompose';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Checkbox } from 'antd';
import {
  FormSection,
  FormInputField,
  FormSelectField,
  FormSelect,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import FormInput from '../../../../../components/Form/FormInput';

const { DefaultSelect } = FormSelect;

const messages = defineMessages({
  sectionSubtitle1: {
    id: 'goalEditor.section.subtitle1',
    defaultMessage: 'Give your Goal a conversion value.',
  },
  sectionTitle1: {
    id: 'goalEditor.section.subtitle2',
    defaultMessage: 'Conversion Value',
  },
  defaultGoalValueLabel: {
    id: 'goalEditor.default.value.label',
    defaultMessage: 'Default Value',
  },
  defaultGoalValuePlaceholder: {
    id: 'goalEditor.default.value.placeholder',
    defaultMessage: 'Ex: 500',
  },
  defaultGoalValueTooltip: {
    id: 'goalEditor.default.value.tooltip',
    defaultMessage: 'Lorem Ipsum',
  },
  goalValueCurrencyLabel: {
    id: 'goalEditor.value.currency.label',
    defaultMessage: 'Default Value',
  },
  goalValueCurrencyPlaceholder: {
    id: 'goalEditor.value.currency.placeholder',
    defaultMessage: 'Ex: 500',
  },
  goalValueCurrencyTooltip: {
    id: 'goalEditor.value.currency.tooltip',
    defaultMessage: 'Lorem Ipsum',
  },
});

interface State {
  displayConversionValueSection: boolean;
}

type Props = InjectedIntlProps & ValidatorProps;

class ConversionValueFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayConversionValueSection: false };
  }

  toggleConversionValueSection = () => {
    this.setState({
      displayConversionValueSection: !this.state.displayConversionValueSection,
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />

        <Checkbox
          checked={this.state.displayConversionValueSection}
          onChange={this.toggleConversionValueSection}
        >
          <FormattedMessage
            id="goal-conversion-value-checkbox-message"
            defaultMessage="Add a conversion value"
          />
        </Checkbox>

        <div
          className={
            !this.state.displayConversionValueSection
              ? 'hide-section'
              : 'optional-section-content'
          }
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <FormInputField
                name="goal.goal_default_value"
                component={FormInput}
                formItemProps={{
                  label: formatMessage(messages.defaultGoalValueLabel),
                }}
                inputProps={{
                  placeholder: formatMessage(
                    messages.defaultGoalValuePlaceholder,
                  ),
                }}
                helpToolTipProps={{
                  title: formatMessage(messages.defaultGoalValueTooltip),
                }}
              />
            </Col>
            <Col className="gutter-row" span={12}>
              <FormSelectField
                name="goal.goal_value_currency"
                component={DefaultSelect}
                formItemProps={{
                  label: formatMessage(messages.goalValueCurrencyLabel),
                }}
                options={[
                  {
                    title: 'EUR',
                    value: 'EUR',
                  },
                ]}
                helpToolTipProps={{
                  title: formatMessage(messages.goalValueCurrencyTooltip),
                }}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(ConversionValueFormSection);
