import * as React from 'react';
import { WrappedFieldArrayProps, Validator } from 'redux-form';
import { Button, Row, Col } from 'antd';
import { compose } from 'recompose';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl';

import { AdGroupsInfosFieldModel } from '../domain';
import { McsIcons } from '../../../../../../components/index';
import {
  FormInput,
  FormSelect,
  FormSelectField,
  FormInputField,
  FormDatePickerField,
  FormDatePicker,
} from '../../../../../../components/Form/index';
import { AdGroupResource } from '../../../../../../models/campaign/display/AdGroupResource';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';

const { DefaultSelect } = FormSelect;

const editableAdGroupProperties: Array<keyof AdGroupResource> = [
  'total_budget',
  'max_bid_price',
  'max_budget_per_period',
  'start_date',
  'end_date',
];

type JoinedProps = WrappedFieldArrayProps<AdGroupsInfosFieldModel> &
  InjectedIntlProps &
  ValidatorProps;

class AdGroupsInfos extends React.Component<JoinedProps> {
  getAvailableOptions = () => {
    const { fields, intl } = this.props;

    const selected = fields.getAll()
      ? fields.getAll().map(f => f.adGroupProperty)
      : [];

    return editableAdGroupProperties.map(adGroupProperty => {
      return {
        title: intl.formatMessage(adGroupPropertiesMessageMap[adGroupProperty]),
        value: adGroupProperty,
        disabled: selected.includes(adGroupProperty),
      };
    });
  };

  componentDidMount() {
    const { fields } = this.props;
    fields.push({
      adGroupProperty: this.getAvailableOptions()[0].value,
      action: 'equals',
    });
  }

  attachToDOM = (elementId: string) => (triggerNode: Element) => {
    return document.getElementById(elementId) as any;
  };

  render() {
    const {
      fields,
      fieldValidators: { isRequired, isValidInteger, isNotZero, isValidFloat },
    } = this.props;

    const actionOptions: Array<{
      title: string;
      value: string; // { [key: string]: FormattedMessage.MessageDescriptor }
    }> = [
      {
        title: '=',
        value: 'equals',
      },
      {
        title: 'Increase %',
        value: 'increase',
      },
      {
        title: 'Decrease %',
        value: 'decrease',
      },
    ];

    const adField = () => {
      const firstSelectableOptions = this.getAvailableOptions().filter(
        option => !option.disabled,
      );
      fields.push({
        adGroupProperty: firstSelectableOptions[0].value,
        action: 'equals',
      });
    };

    return (
      <div>
        <Row>
          {fields.map((name: string, index: number) => {
            const removeField = () => fields.remove(index);
            const isTimeInput =
              fields.get(index).adGroupProperty === 'start_date' ||
              fields.get(index).adGroupProperty === 'end_date';
            let validates: Validator[] = [];
            switch (fields.get(index).adGroupProperty) {
              case 'max_bid_price':
                validates = [isRequired, isValidInteger];
                break;
              case 'total_budget':
                validates = [isRequired, isValidFloat, isNotZero];
                break;

              case 'max_budget_per_period':
                validates = [isRequired, isValidFloat, isNotZero];
                break;
              case 'start_date' || 'end_date':
                validates = [isRequired];
            }
            return (
              <Row key={index} gutter={16}>
                <Col className="gutter-row" span={7}>
                  <FormSelectField
                    name={`${name}.adGroupProperty`}
                    component={DefaultSelect}
                    options={this.getAvailableOptions()}
                    formItemProps={{
                      label: 'Field',
                      labelCol: { span: 4 },
                      wrapperCol: { span: 20 },
                    }}
                  />
                </Col>
                <Col className="gutter-row" span={7}>
                  <FormSelectField
                    name={`${name}.action`}
                    component={DefaultSelect}
                    formItemProps={{
                      label: 'Action',
                      labelCol: { span: 4 },
                      wrapperCol: { span: 20 },
                    }}
                    options={isTimeInput ? [actionOptions[0]] : actionOptions}
                  />
                </Col>
                <Col className="gutter-row" span={7}>
                  {isTimeInput ? (
                    <FormDatePickerField
                      name={`${name}.value`}
                      component={FormDatePicker}
                      validate={validates}
                      unixTimestamp={true}
                      formItemProps={{
                        label: 'Value',
                        labelCol: { span: 4 },
                        wrapperCol: { span: 20 },
                      }}
                      datePickerProps={{ style: { width: '100%' } }}
                    />
                  ) : (
                    <FormInputField
                      name={`${name}.value`}
                      component={FormInput}
                      validate={validates}
                      formItemProps={{
                        label: 'Value',
                        labelCol: { span: 4 },
                        wrapperCol: { span: 20 },
                      }}
                      inputProps={{}}
                    />
                  )}
                </Col>
                <Col className="gutter-row" span={3}>
                  <Button className="delete-fieldarray" onClick={removeField}>
                    <McsIcons type="close" />
                  </Button>
                </Col>
              </Row>
            );
          })}
        </Row>
        {fields.getAll() &&
          fields.getAll().length <= editableAdGroupProperties.length - 1 && (
            <Row>
              <div onClick={adField}>
                <Col span={22} offset={1} className="gutter-row AddFieldButton">
                  <p>
                    <McsIcons type="plus" />
                    Add Field
                  </p>
                </Col>
              </div>
            </Row>
          )}
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(AdGroupsInfos);

const adGroupPropertiesMessageMap: {
  [propertyName in keyof Partial<
    AdGroupResource
  >]: FormattedMessage.MessageDescriptor
} = defineMessages({
  max_bid_price: {
    id: 'edit.adgroups.option.max.bid.price',
    defaultMessage: 'Max Bid Price',
  },
  total_budget: {
    id: 'edit.adgroups.option.total.budget',
    defaultMessage: 'Total Budget',
  },
  max_budget_per_period: {
    id: 'edit.adgroups.option.budget.split',
    defaultMessage: 'Budget Split',
  },
  start_date: {
    id: 'edit.adgroups.option.start.date',
    defaultMessage: 'Start Date',
  },
  end_date: {
    id: 'edit.adgroups.option.end.date',
    defaultMessage: 'End Date',
  },
});
