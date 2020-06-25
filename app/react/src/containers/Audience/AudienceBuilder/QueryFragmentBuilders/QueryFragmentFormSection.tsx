import * as React from 'react';
import {
  WrappedFieldArrayProps,
  FieldArray,
  reduxForm,
  GenericFieldArray,
  Field,
  InjectedFormProps,
} from 'redux-form';
import { Button } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages, FORM_ID } from '../constants';
import { Card } from '@mediarithmics-private/mcs-components-library';
import {
  isAudienceBuilderGroupNode,
  AudienceBuilderFormData,
  AudienceBuilderGroupNode,
  AudienceBuilderFieldNode,
} from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { McsIcon } from '../../../../components';
import AudienceFeatureFormSection, {
  AudienceFeatureFormSectionProps,
} from './AudienceFeatureFormSection';
import cuid from 'cuid';

export const AudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AudienceFeatureFormSectionProps
>;

export interface QueryFragmentFormSectionProps {}

type Props = WrappedFieldArrayProps<AudienceBuilderGroupNode> &
  InjectedFormProps<AudienceBuilderFormData, QueryFragmentFormSectionProps> &
  QueryFragmentFormSectionProps &
  InjectedIntlProps;

class QueryFragmentFormSection extends React.Component<Props> {
  addGroupExpression = (exclude: boolean) => () => {
    const { change, fields } = this.props;

    const newGroupExpression: AudienceBuilderGroupNode = {
      key: cuid(),
      model: {
        type: 'GROUP',
        boolean_operator: 'OR',
        negation: exclude,
        expressions: [],
      },
    };
    const newExpressions = fields.getAll().concat(newGroupExpression);
    change('where.expressions', newExpressions);
  };

  renderQueryBuilderButtons = () => {
    return (
      <div className="mcs-segmentBuilder_queryButtons">
        <Button
          className="mcs-segmentBuilder_narrowWithButton"
          onClick={this.addGroupExpression(false)}
        >
          Narrow with
        </Button>
        <br />
        - or -
        <br />
        <Button
          className="mcs-segmentBuilder_excludeButton"
          onClick={this.addGroupExpression(true)}
        >
          Exclude
        </Button>
      </div>
    );
  };

  addFeature = (groupExpressionKey: string) => () => {
    const { change, fields } = this.props;

    const newFeature: AudienceBuilderFieldNode = {
      key: cuid(),
      model: {
        type: 'FIELD',
        field: 'XXX',
        comparison: {
          type: 'STRING',
          operator: 'EQ',
          values: [''],
        },
      },
    };

    const newFields = fields.getAll().map(f => {
      if (f.key === groupExpressionKey) {
        return {
          ...f,
          model: {
            ...f.model,
            expressions: f.model.expressions.concat(newFeature),
          },
        };
      } else {
        return f;
      }
    });

    change('where.expressions', newFields);
  };

  render() {
    const { fields, intl } = this.props;

    return (
      <React.Fragment>
        {fields &&
          fields.getAll() &&
          fields.getAll().map((expressionField, index) => {
            const handleRemove = () => fields.remove(index);
            return (
              isAudienceBuilderGroupNode(expressionField.model) && (
                <React.Fragment key={expressionField.key}>
                  {index !== 0 && (
                    <div className="mcs-segmentBuilder_queryButtons">
                      {intl.formatMessage(messages.narrowingWith)}
                    </div>
                  )}
                  <Card
                    className="mcs-segmentBuilder_categoryCard"
                    title={
                      index === 0
                        ? intl.formatMessage(messages.demographics)
                        : intl.formatMessage(messages.audienceFeatures)
                    }
                    buttons={
                      true && (
                        <Button
                          className="mcs-segmentBuilder_closeButton"
                          onClick={handleRemove}
                        >
                          <McsIcon type="close" />
                        </Button>
                      )
                    }
                  >
                    <AudienceFeatureFieldArray
                      name={`where.expressions[${index}].model.expressions`}
                      component={AudienceFeatureFormSection}
                    />
                    <div className="mcs-segmentBuilder_categoryCardFooter">
                      <Button
                        onClick={this.addFeature(expressionField.key)}
                        className="mcs-segmentBuilder_moreButton"
                      >
                        Add more audience features
                      </Button>
                    </div>
                  </Card>
                </React.Fragment>
              )
            );
          })}
        {this.renderQueryBuilderButtons()}
      </React.Fragment>
    );
  }
}

export default compose<Props, QueryFragmentFormSectionProps>(
  injectIntl,
  reduxForm<AudienceBuilderFormData, QueryFragmentFormSectionProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(QueryFragmentFormSection);
