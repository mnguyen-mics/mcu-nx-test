import * as React from 'react';
import { WrappedFieldArrayProps, Validator } from 'redux-form';
import { Button, Row, Col } from 'antd';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl, defineMessages, MessageDescriptor } from 'react-intl';

import { CampaignsInfosFieldModel } from '../domain';
import {
  FormInput,
  DefaultSelect,
  FormSelectField,
  FormInputField,
} from '../../../../../../components/Form/index';
import { DisplayCampaignResource } from '../../../../../../models/campaign/display/index';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

const editableCampaignProperties: Array<keyof DisplayCampaignResource> = [
  'total_impression_capping',
  'per_day_impression_capping',
  'total_budget',
  'max_budget_per_period',
];

type JoinedProps = WrappedFieldArrayProps<CampaignsInfosFieldModel> &
  WrappedComponentProps &
  ValidatorProps;

class CampaignsInfos extends React.Component<JoinedProps> {
  getAvailableOptions = () => {
    const { fields, intl } = this.props;

    const selected = fields.getAll() ? fields.getAll().map(f => f.campaignProperty) : [];

    return editableCampaignProperties.map(campaignProperty => {
      return {
        title: intl.formatMessage(campaignPropertiesMessageMap[campaignProperty]!),
        value: campaignProperty,
        disabled: selected.includes(campaignProperty),
      };
    });
  };

  componentDidMount() {
    const { fields } = this.props;
    fields.push({
      campaignProperty: this.getAvailableOptions()[0].value,
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
      intl,
    } = this.props;
    const equals = 'equals';
    const increase = 'increase';
    const decrease = 'decrease';
    const actionOptions: Array<{
      title: string;
      value: string; // { [key: string]: MessageDescriptor }
    }> = [
      {
        title: intl.formatMessage(campaignsActionsMessageMap[equals]),
        value: 'equals',
      },
      {
        title: intl.formatMessage(campaignsActionsMessageMap[increase]),
        value: 'increase',
      },
      {
        title: intl.formatMessage(campaignsActionsMessageMap[decrease]),
        value: 'decrease',
      },
    ];

    const adField = () => {
      const firstSelectableOptions = this.getAvailableOptions().filter(option => !option.disabled);
      fields.push({
        campaignProperty: firstSelectableOptions[0].value,
        action: 'equals',
      });
    };

    return (
      <div style={{ width: '70%', margin: 'auto' }}>
        <Row style={{ display: 'block' }}>
          {fields.map((name: string, index: number) => {
            const removeField = () => fields.remove(index);
            let validates: Validator[] = [];
            switch (fields.get(index).campaignProperty) {
              case 'total_impression_capping':
                validates = [isRequired, isValidInteger];
                break;
              case 'per_day_impression_capping':
                validates = [isRequired, isValidInteger];
                break;
              case 'total_budget':
                validates = [isRequired, isValidFloat, isNotZero];
                break;

              case 'max_budget_per_period':
                validates = [isRequired, isValidFloat, isNotZero];
                break;
            }
            return (
              <Row key={index} gutter={16}>
                <Col className='gutter-row' span={7}>
                  <FormSelectField
                    name={`${name}.campaignProperty`}
                    component={DefaultSelect}
                    options={this.getAvailableOptions()}
                    formItemProps={{
                      label: 'Field',
                      labelCol: { span: 4 },
                      wrapperCol: { span: 20 },
                    }}
                  />
                </Col>
                <Col className='gutter-row' span={7}>
                  <FormSelectField
                    name={`${name}.action`}
                    component={DefaultSelect}
                    formItemProps={{
                      label: 'Action',
                      labelCol: { span: 4 },
                      wrapperCol: { span: 20 },
                    }}
                    options={actionOptions}
                  />
                </Col>
                <Col className='gutter-row' span={7}>
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
                </Col>
                <Col className='gutter-row' span={3}>
                  <Button className='delete-fieldarray' onClick={removeField}>
                    <McsIcon type='close' />
                  </Button>
                </Col>
              </Row>
            );
          })}
        </Row>
        {fields.getAll() && fields.getAll().length <= editableCampaignProperties.length - 1 && (
          <Row style={{ display: 'block' }}>
            <div onClick={adField}>
              <Col span={22} offset={1} className='gutter-row add-field-button'>
                <p>
                  <McsIcon type='plus' />
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

export default compose(injectIntl, withValidators)(CampaignsInfos);

const campaignPropertiesMessageMap: {
  [propertyName in keyof Partial<DisplayCampaignResource>]: MessageDescriptor;
} = defineMessages({
  total_impression_capping: {
    id: 'display.campaigns.multiEdit.option.totalImpressionCapping',
    defaultMessage: 'Total Impression Capping',
  },
  per_day_impression_capping: {
    id: 'display.campaigns.multiEdit.option.dailyImpressionCapping',
    defaultMessage: 'Daily Impression Capping',
  },
  total_budget: {
    id: 'display.campaigns.multiEdit.option.totalBudget',
    defaultMessage: 'Total Budget',
  },
  max_budget_per_period: {
    id: 'display.campaigns.multiEdit.option.budgetSplit',
    defaultMessage: 'Budget Split',
  },
});

const campaignsActionsMessageMap: {
  [propertyName: string]: MessageDescriptor;
} = defineMessages({
  equals: {
    id: 'display.campaigns.multiEdit.option.equals',
    defaultMessage: '=',
  },
  increase: {
    id: 'display.campaigns.multiEdit.option.increase',
    defaultMessage: 'Increase %',
  },
  decrease: {
    id: 'display.campaigns.multiEdit.option.decrease',
    defaultMessage: 'Decrease %',
  },
});
