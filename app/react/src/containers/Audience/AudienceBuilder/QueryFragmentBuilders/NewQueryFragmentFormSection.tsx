import * as React from 'react';
import {
  WrappedFieldArrayProps,
  FieldArray,
  GenericFieldArray,
  Field,
} from 'redux-form';
import { Button, Timeline } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../constants';
import { Card, McsIcon } from '@mediarithmics-private/mcs-components-library';
import {
  AudienceBuilderGroupNode,
  AudienceBuilderNodeShape,
  AudienceBuilderParametricPredicateNode,
} from '../../../../models/audienceBuilder/AudienceBuilderResource';
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
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import NewAudienceFeatureSelector, {
  NewAudienceFeatureSelectorProps,
} from './NewAudienceFeatureSelector';

export const AudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AudienceFeatureFormSectionProps
>;

export interface NewQueryFragmentFormSectionProps {
  datamartId: string;
  demographicsFeaturesIds: string[];
  formChange(field: string, value: any): void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
}

type Props = WrappedFieldArrayProps<AudienceBuilderGroupNode> &
  InjectedDrawerProps &
  NewQueryFragmentFormSectionProps &
  InjectedFeaturesProps &
  InjectedIntlProps;

interface State {
  audienceFeatures?: AudienceFeatureResource[];
}

class NewQueryFragmentFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      audienceFeatures: this.props.audienceFeatures,
    };
  };

  newAudienceBuilderGroup = (
    include: boolean = true,
    expressions: AudienceBuilderNodeShape[] = []
  ): AudienceBuilderGroupNode => {
    return {
      type: 'GROUP',
      boolean_operator: 'OR',
      negation: !include,
      expressions: expressions,
    };
  };

  renderQueryBuilderButtons = () => {
    return (
      <div className="mcs-audienceBuilder_queryButtons-2">
        <Button
          className="mcs-audienceBuilder_narrowWithButton"
          onClick={this.selectNewAudienceFeature(this.addAudienceFeature())}
        >
          Include
        </Button>
        /
        <Button
          className="mcs-audienceBuilder_excludeButton"
          onClick={this.selectNewAudienceFeature(this.addAudienceFeature())}
        >
          Exclude
        </Button>
      </div>
    );
  };

  newParametricPredicate = (audienceFeature: AudienceFeatureResource): AudienceBuilderParametricPredicateNode => {
    const parameters: { [key: string]: string[] | undefined } = {};

    audienceFeature.variables.forEach(v => {
      parameters[v.field_name] = undefined;
    });

    return {
      type: 'PARAMETRIC_PREDICATE',
      parametric_predicate_id: audienceFeature.id,
      parameters: parameters,
    };
  };

  addPredicateToGroup(
    predicate: AudienceBuilderParametricPredicateNode,
    groupIndex?: number
  ) {
    const { formChange, fields } = this.props;

    let addToGroup = (
      groupIndex: number,
      predicate: AudienceBuilderParametricPredicateNode
    ): AudienceBuilderGroupNode[] => {
      return fields.getAll().map((f, i) => {
        if (i === groupIndex) {
          return {
            ...f,
            expressions: f.expressions.concat(predicate),
          };
        } else {
          return f;
        }
      });
    }

    let addToNewGroup = (
      predicate: AudienceBuilderParametricPredicateNode
    ): AudienceBuilderGroupNode[] => {
      const newGroup = this.newAudienceBuilderGroup();
      return fields.getAll().concat(newGroup);
    }

    const updatedGroups = groupIndex ?
      addToGroup(groupIndex, predicate) :
      addToNewGroup(predicate)

    formChange('where.expressions', updatedGroups);
  };

  addAudienceFeature = (groupIndex?: number) => (
    audienceFeatures: AudienceFeatureResource[]
  ) => {
    const { closeNextDrawer } = this.props;

    if (audienceFeatures[0]) {
      const predicate = this.newParametricPredicate(audienceFeatures[0])
      this.addPredicateToGroup(predicate, groupIndex)

      this.setState({
        audienceFeatures: this.state.audienceFeatures?.concat(
          audienceFeatures[0],
        ),
      });

      closeNextDrawer();
    }
  };

  selectNewAudienceFeature = (onSave: (_: AudienceFeatureResource[]) => void) => () => {
    const {
      openNextDrawer,
      datamartId,
      demographicsFeaturesIds,
      hasFeature,
    } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: datamartId,
      close: this.props.closeNextDrawer,
      save: onSave,
      demographicIds:
        demographicsFeaturesIds.length >= 1
          ? demographicsFeaturesIds
          : undefined,
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
    } = this.props;

    const { audienceFeatures } = this.state;

    return (
      <React.Fragment>
        <div className="mcs-timeline">

          {fields.map((name, index) => {
            const handleRemove = () => {
              fields.remove(index);
            };

            return (
              <React.Fragment key={`${index}_${fields.length}`}>
                <Timeline.Item
                  dot={<McsIcon type="status" className={'mcs-timeline-initial-dot'} />}
                >
                  {index == 0 && intl.formatMessage(messages.audienceBuilderTimelineMatchingCriterias)}

                  <Card
                    className={'mcs-audienceBuilder_categoryCard'}
                    buttons={
                      index !== 0 && (
                        <Button
                          className="mcs-audienceBuilder_closeButton"
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
                      objectTypes={objectTypes}
                      audienceFeatures={audienceFeatures}
                      isDemographicsSection={
                        index === 0 && demographicsFeaturesIds.length >= 1
                      }
                    />
                  </Card>
                </Timeline.Item>



                <Timeline.Item
                  dot={
                    <Button
                      className="mcs-audienceBuilder_moreButton"
                      onClick={this.selectNewAudienceFeature(this.addAudienceFeature(index))}
                    >
                      <McsIcon type="status" className={'mcs-timeline-add-dot'} />
                    </Button>
                  }
                >
                  {index == 0 ? intl.formatMessage(messages.audienceBuilderTimelineAddCriteria) : ""}
                </Timeline.Item>


              </React.Fragment>
            );
          })}
        </div>
        {this.renderQueryBuilderButtons()}
      </React.Fragment >
    );
  }
}

export default compose<Props, NewQueryFragmentFormSectionProps>(
  injectIntl,
  injectDrawer,
  injectFeatures,
)(NewQueryFragmentFormSection);
