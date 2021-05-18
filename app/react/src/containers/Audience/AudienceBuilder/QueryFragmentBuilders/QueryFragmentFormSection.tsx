import * as React from 'react';
import { WrappedFieldArrayProps, FieldArray, GenericFieldArray, Field } from 'redux-form';
import { Button } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../constants';
import { Card, McsIcon } from '@mediarithmics-private/mcs-components-library';
import {
  AudienceBuilderGroupNode,
  AudienceBuilderParametricPredicateNode,
} from '../../../../models/audienceBuilder/AudienceBuilderResource';
import AudienceFeatureFormSection, {
  AudienceFeatureFormSectionProps,
} from './AudienceFeatureFormSection';
import injectDrawer, { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import AudienceFeatureSelector, { AudienceFeatureSelectorProps } from './AudienceFeatureSelector';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import NewAudienceFeatureSelector, {
  NewAudienceFeatureSelectorProps,
} from './NewAudienceFeatureSelector';

export const AudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AudienceFeatureFormSectionProps
>;

export interface QueryFragmentFormSectionProps {
  datamartId: string;
  demographicsFeaturesIds: string[];
  formChange(field: string, value: any): void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
}

type Props = WrappedFieldArrayProps<AudienceBuilderGroupNode> &
  InjectedDrawerProps &
  QueryFragmentFormSectionProps &
  InjectedFeaturesProps &
  InjectedIntlProps;

interface State {
  audienceFeatures?: AudienceFeatureResource[];
}

class QueryFragmentFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      audienceFeatures: this.props.audienceFeatures,
    };
  }

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
      <div className='mcs-audienceBuilder_queryButtons'>
        <Button
          className='mcs-audienceBuilder_narrowWithButton'
          onClick={this.addGroupExpression(false)}
        >
          Narrow with
        </Button>
        <br />
        - or -
        <br />
        <Button
          className='mcs-audienceBuilder_excludeButton'
          onClick={this.addGroupExpression(true)}
        >
          Exclude
        </Button>
      </div>
    );
  };

  addAudienceFeature = (index: number) => (audienceFeatures: AudienceFeatureResource[]) => {
    const { formChange, fields, closeNextDrawer } = this.props;

    const parameters: { [key: string]: string[] | undefined } = {};
    if (audienceFeatures[0]) {
      audienceFeatures[0].variables?.forEach(v => {
        parameters[v.field_name] = undefined;
      });
      const newFeature: AudienceBuilderParametricPredicateNode = {
        type: 'PARAMETRIC_PREDICATE',
        parametric_predicate_id: audienceFeatures[0].id,
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

      this.setState({
        audienceFeatures: this.state.audienceFeatures?.concat(audienceFeatures[0]),
      });

      formChange('where.expressions', newFields);
      closeNextDrawer();
    }
  };

  addFeature = (index: number) => () => {
    const { openNextDrawer, datamartId, hasFeature } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: datamartId,
      close: this.props.closeNextDrawer,
      save: this.addAudienceFeature(index),
    };
    hasFeature('new-audienceFeatureSelector')
      ? openNextDrawer<NewAudienceFeatureSelectorProps>(NewAudienceFeatureSelector, {
          additionalProps: props,
        })
      : openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
          additionalProps: props,
        });
  };

  render() {
    const {
      fields,
      intl,
      datamartId,
      demographicsFeaturesIds,
      objectTypes,
      formChange,
    } = this.props;

    const { audienceFeatures } = this.state;

    return (
      <React.Fragment>
        {fields.map((name, index) => {
          const handleRemove = () => {
            fields.remove(index);
          };
          return (
            <React.Fragment key={`${index}_${fields.length}`}>
              {index !== 0 && (
                <div className='mcs-audienceBuilder_queryButtons'>
                  {fields.get(index).negation
                    ? intl.formatMessage(messages.excludingWith)
                    : intl.formatMessage(messages.narrowingWith)}
                </div>
              )}
              <Card
                className={'mcs-audienceBuilder_categoryCard'}
                title={
                  index === 0 && demographicsFeaturesIds.length >= 1
                    ? intl.formatMessage(messages.demographics)
                    : intl.formatMessage(messages.audienceFeatures)
                }
                buttons={
                  index !== 0 && (
                    <Button className='mcs-audienceBuilder_closeButton' onClick={handleRemove}>
                      <McsIcon type='close' />
                    </Button>
                  )
                }
              >
                <AudienceFeatureFieldArray
                  name={`${name}.expressions`}
                  component={AudienceFeatureFormSection}
                  datamartId={datamartId}
                  objectTypes={objectTypes}
                  audienceFeatures={audienceFeatures}
                  formChange={formChange}
                  isDemographicsSection={index === 0 && demographicsFeaturesIds.length >= 1}
                />
                {(index !== 0 || demographicsFeaturesIds.length === 0) && (
                  <div className='mcs-audienceBuilder_categoryCardFooter'>
                    <Button
                      onClick={this.addFeature(index)}
                      className='mcs-audienceBuilder_moreButton'
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
  injectFeatures,
)(QueryFragmentFormSection);
