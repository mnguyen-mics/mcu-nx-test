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
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import AudienceFeatureSelector, {
  AudienceFeatureSelectorProps,
} from './AudienceFeatureSelector';
import { ParametricPredicateResource } from '../../../../models/parametricPredicate';

export const AudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AudienceFeatureFormSectionProps
>;

export interface QueryFragmentFormSectionProps {
  datamartId: string;
}

type Props = WrappedFieldArrayProps<AudienceBuilderGroupNode> &
  InjectedDrawerProps &
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

  saveAudienceFeatures = (groupExpressionKey: string) => (
    audienceFeatures: ParametricPredicateResource[],
  ) => {
    const { change, fields, closeNextDrawer } = this.props;

    const newFeature: AudienceBuilderFieldNode = {
      key: cuid(),
      parametricPredicateResource: {
        ...audienceFeatures[0],
      },
      model: {
        type: 'FIELD',
        field: audienceFeatures[0].name,
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
    closeNextDrawer();
  };

  addFeature = (expressionKey: string) => () => {
    const { openNextDrawer, datamartId } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: datamartId,
      close: this.props.closeNextDrawer,
      save: this.saveAudienceFeatures(expressionKey),
    };

    openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
      additionalProps: props,
    });
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
                      {expressionField.model.negation
                        ? intl.formatMessage(messages.excludingWith)
                        : intl.formatMessage(messages.narrowingWith)}
                    </div>
                  )}
                  <Card
                    className={'mcs-segmentBuilder_categoryCard'}
                    title={
                      index === 0
                        ? intl.formatMessage(messages.demographics)
                        : intl.formatMessage(messages.audienceFeatures)
                    }
                    buttons={
                      index !== 0 && (
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
                      isDemographicsSection={index === 0}
                    />
                    {index !== 0 && (
                      <div className="mcs-segmentBuilder_categoryCardFooter">
                        <Button
                          onClick={this.addFeature(expressionField.key)}
                          className="mcs-segmentBuilder_moreButton"
                        >
                          {intl.formatMessage(messages.addAudienceFeature)}
                        </Button>
                      </div>
                    )}
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
  injectDrawer,
  reduxForm<AudienceBuilderFormData, QueryFragmentFormSectionProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(QueryFragmentFormSection);
