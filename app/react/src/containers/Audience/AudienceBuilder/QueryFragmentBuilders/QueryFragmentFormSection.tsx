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
  AudienceBuilderFormData,
  AudienceBuilderGroupNode,
  AudienceBuilderParametricPredicateNode,
} from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { McsIcon } from '../../../../components';
import AudienceFeatureFormSection, {
  AudienceFeatureFormSectionProps,
} from './AudienceFeatureFormSection';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import AudienceFeatureSelector, {
  AudienceFeatureSelectorProps,
} from './AudienceFeatureSelector';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { isAudienceFeatureIntervalVariable } from '../../../../models/audienceFeature/AudienceFeatureResource';

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
    const { fields } = this.props;

    const newGroupExpression: AudienceBuilderGroupNode = {
      type: 'GROUP',
      boolean_operator: 'OR',
      negation: exclude,
      expressions: [],
    };

    fields.push(newGroupExpression);
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

  addAudienceFeature = (index: number) => (
    audienceFeatures: AudienceFeatureResource[],
  ) => {
    const { change, fields, closeNextDrawer } = this.props;

    const parameters: { [key: string]: string[] | undefined } = {};
    audienceFeatures[0].variables.forEach(v => {
      if (isAudienceFeatureIntervalVariable(v)) {
        parameters[v.from] = undefined;
        parameters[v.to] = undefined;
      } else {
        parameters[v.name] = undefined;
      }
    });
    const newFeature: AudienceBuilderParametricPredicateNode = {
      type: 'PARAMETRIC_PREDICATE',
      id: audienceFeatures[0].id,
      parameters: parameters,
    };

    const newFields = fields.getAll().map((f, i) => {
      if (i === index) {
        return {
          ...f,
          expressions: f.expressions.concat(newFeature),
        };
      } else {
        return f;
      }
    });

    change('where.expressions', newFields);
    closeNextDrawer();
  };

  addFeature = (index: number) => () => {
    const { openNextDrawer, datamartId } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: datamartId,
      close: this.props.closeNextDrawer,
      save: this.addAudienceFeature(index),
    };

    openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
      additionalProps: props,
    });
  };

  render() {
    const { fields, intl, datamartId } = this.props;

    return (
      <React.Fragment>
        {fields.map((name, index) => {
          const handleRemove = () => {
            fields.remove(index);
          };
          return (
            <React.Fragment key={`${index}_${fields.length}`}>
              {index !== 0 && (
                <div className="mcs-segmentBuilder_queryButtons">
                  {fields.get(index).negation
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
                  name={`${name}.expressions`}
                  component={AudienceFeatureFormSection}
                  datamartId={datamartId}
                  isDemographicsSection={index === 0}
                />
                {index !== 0 && (
                  <div className="mcs-segmentBuilder_categoryCardFooter">
                    <Button
                      onClick={this.addFeature(index)}
                      className="mcs-segmentBuilder_moreButton"
                    >
                      {intl.formatMessage(messages.addAudienceFeature)}
                    </Button>
                  </div>
                )}
              </Card>
            </React.Fragment>
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
  }),
)(QueryFragmentFormSection);
