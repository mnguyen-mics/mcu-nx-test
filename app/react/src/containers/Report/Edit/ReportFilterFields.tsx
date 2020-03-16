import * as React from 'react';
import { WrappedFieldArrayProps, Field, GenericField } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Row, Col } from 'antd';

import messages from './messages';
import McsIcon from '../../../components/McsIcon';
import FormLinkedSelectInput, {
  FormLinkedSelectInputProps,
} from '../../../components/Form/FormLinkedSelectInput';

interface FormLinkedSelectInputModel {
  leftValue: string;
  rightValue: string;
}

type JoinedProps = InjectedIntlProps &
  FormLinkedSelectInputProps &
  WrappedFieldArrayProps<FormLinkedSelectInputModel>;

const FormLinkedSelectInputField = Field as new () => GenericField<
  FormLinkedSelectInputProps
>;

class ReportFilterFields extends React.Component<JoinedProps> {
  render() {
    const { fields, intl, leftOptionsProps } = this.props;

    const handleOnClick = () => fields.push({ leftValue: '', rightValue: '' });

    const renderedFields = fields.map((name, index, _fields) => {
      const handleRemove = () => fields.remove(index);
      const removeButton = () => (
        <div onClick={handleRemove}>
          <McsIcon type="close" />
        </div>
      );
      return (
        <div key={index}>
          <FormLinkedSelectInputField
            name={`${name}`}
            component={FormLinkedSelectInput}
            renderFieldAction={removeButton}
            formItemProps={{ colon: false }}
            leftFormSelectProps={{
              placeholder: intl.formatMessage(
                messages.reportSectionDetailedFilterLeftSelectPlaceholder,
              ),
            }}
            leftOptionsProps={leftOptionsProps}
          />
        </div>
      );
    });

    return (
      <div>
        <Row>
          <Col span={24} offset={3}>
            {renderedFields}
          </Col>
        </Row>
        <Row>
          <Col span={15} offset={4}>
            <div onClick={handleOnClick}>
              <Col span={20} className="report-AddFilterButton">
                <p>
                  <McsIcon type="plus" />
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
