import * as React from 'react';
import { WrappedFieldArrayProps, Field, GenericField } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Row, Col } from 'antd';

import messages from '../messages';
import McsIcon from '../../../../../../components/McsIcon';
import FormLinkedTextInput, {
  FormLinkedTextInputProps,
} from '../../../../../../components/Form/FormLinkedTextInput';

interface FormLinkedTextInputModel {
  leftValue: string;
  rightValue: string;
}

type JoinedProps = InjectedIntlProps &
  FormLinkedTextInputProps &
  WrappedFieldArrayProps<FormLinkedTextInputModel>;

const FormLinkedTextInputField = Field as new () => GenericField<
  FormLinkedTextInputProps
>;

class PropertyFields extends React.Component<JoinedProps> {
  render() {
    const { fields, intl } = this.props;

    const handleOnClick = () => fields.push({ leftValue: '', rightValue: '' });

    const renderedFields = (fields).map((name, index, _fields) => {
      const handleRemove = () => fields.remove(index);
      const removeButton = () => (
        <div onClick={handleRemove}>
          <McsIcon type="close" />
        </div>
      );
      return (
        <div key={index}>
          <FormLinkedTextInputField
            {...this.props}
            name={`${name}`}
            component={FormLinkedTextInput}
            renderFieldAction={removeButton}
          />
        </div>
      );
    });

    return (
      <div>
        <Row>
          <Col span={24} offset={this.props.formItemProps.label ? 0 : 3}>
            {renderedFields}
          </Col>
        </Row>
        <Row>
          <Col span={10} offset={4}>
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

export default injectIntl(PropertyFields);
