import * as React from 'react';
import { WrappedFieldArrayProps, Field, GenericField } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Row, Col } from 'antd';

import messages from './messages';
import McsIcons from '../../../components/McsIcons';
import FormLinkedSelectInput, { FormLinkedSelectInputProps } from '../../../components/Form/FormLinkedSelectInput';

interface FormLinkedSelectInputModel {
  leftValue: string;
  rightValue: string;
}

type JoinedProps =
  InjectedIntlProps &
  FormLinkedSelectInputProps &
  WrappedFieldArrayProps<FormLinkedSelectInputModel>;

const FormLinkedSelectInputField = Field as new () => GenericField<FormLinkedSelectInputProps>;

class ReportFilterFields extends React.Component<JoinedProps> {

  render() {
    const {
      fields,
      intl,
      leftOptionsProps,
    } = this.props;

    const handleOnClick = () => fields.push({ leftValue: '', rightValue: '' });

    const renderedFields = fields.map((name, index, _fields) => {
      const handleRemove = () => fields.remove(index);
      const removeButton = () => (
        <div
          onClick={handleRemove}
        >
          <McsIcons
            type="close"
          />
        </div>
      );
      return (
        <div
          key={index}
        >
          <FormLinkedSelectInputField
            name={`${name}`}
            component={FormLinkedSelectInput}
            renderFieldAction={removeButton}
            formItemProps={{ colon: false }}
            leftFormSelectProps={{
              placeholder: intl.formatMessage(messages.reportSectionDetailedFilterLeftSelectPlaceholder),
            }}
            leftOptionsProps={leftOptionsProps}
          />
        </div>
      );
    });

    return (
      <div>
        {renderedFields}
        <Row>
          <Col span={10} offset={4}>
            <div
              onClick={handleOnClick}
            >
              <Col span={20} className="report-AddFilterButton">
                <p>
                  <McsIcons
                    type="plus"
                  />
                  {intl.formatMessage(messages.AddFilterButtonText)}
                </p>
              </Col>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default injectIntl(ReportFilterFields);
