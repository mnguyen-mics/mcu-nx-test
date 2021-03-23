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
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { AudienceBuilderParametricPredicateGroupNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import NewAudienceFeatureFormSection, {
  NewAudienceFeatureFormSectionProps,
} from './NewAudienceFeatureFormSection';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';

export const NewAudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  NewAudienceFeatureFormSectionProps
>;

export interface NewQueryFragmentFormSectionProps {
  datamartId: string;
  demographicsFeaturesIds: string[];
  selectAndAddFeature: (
    addToGroup: (_: AudienceBuilderParametricPredicateNode) => void,
  ) => () => void;
  change: (field: string, value: any) => void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
}

type Props = WrappedFieldArrayProps<AudienceBuilderParametricPredicateGroupNode> &
  InjectedDrawerProps &
  NewQueryFragmentFormSectionProps &
  InjectedFeaturesProps &
  InjectedIntlProps;

class NewQueryFragmentFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  addToGroup = (groupIndex: number) => (
    predicate: AudienceBuilderParametricPredicateNode,
  ) => {
    const { fields, change } = this.props;

    const updatedGroups = fields.getAll().map((field, i) => {
      if (i === groupIndex) {
        return {
          ...field,
          expressions: field.expressions.concat(predicate),
        };
      } else {
        return field;
      }
    });

    change(fields.name, updatedGroups);
  };

  render() {
    const {
      fields,
      intl,
      datamartId,
      demographicsFeaturesIds,
      objectTypes,
      selectAndAddFeature,
    } = this.props;

    const { audienceFeatures } = this.props;

    const showCriteriaHelper = (index: number): boolean => {
      return index == 0 && fields.get(index).expressions.length < 2;
    };

    const removeGroup = (index: number) => () => {
      fields.remove(index);
    };

    return (
      /*key={cuid()}*/
      <React.Fragment>
        <div className="mcs-timeline">
          {fields.map((name, index) => {
            return (
              <React.Fragment key={`${index}_${fields.length}`}>
                <div className="mcs-timeline-group">
                  <Timeline.Item
                    // key={cuid()}
                    dot={
                      <McsIcon
                        type="status"
                        className={'mcs-timeline-initial-dot'}
                      />
                    }
                  >
                    <div className="mcs-timeline-title">
                      {intl.formatMessage(
                        messages.audienceBuilderTimelineMatchingCriterias1,
                      )}
                      <span className="mcs-timeline-title-highlight">
                        {intl.formatMessage(
                          messages.audienceBuilderTimelineMatchingCriterias2,
                        )}
                      </span>
                    </div>

                    <NewAudienceFeatureFieldArray
                      name={`${name}.expressions`}
                      component={NewAudienceFeatureFormSection}
                      datamartId={datamartId}
                      removeGroup={removeGroup(index)}
                      objectTypes={objectTypes}
                      audienceFeatures={audienceFeatures}
                      isDemographicsSection={
                        index === 0 && demographicsFeaturesIds.length >= 1
                      }
                    />
                  </Timeline.Item>

                  <Timeline.Item
                    // key={cuid()}
                    dot={
                      <Button
                        className="mcs-timeline-dot-button"
                        onClick={selectAndAddFeature(this.addToGroup(index))}
                      >
                        <McsIcon type="status" className={'mcs-timeline-dot'} />
                      </Button>
                    }
                  >
                    <div className="mcs-timeline-dot-title">
                      {showCriteriaHelper(index) ? (
                        intl.formatMessage(
                          messages.audienceBuilderTimelineAddCriteria,
                        )
                      ) : (
                        <div>{' '}</div>
                      )}
                    </div>
                  </Timeline.Item>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

export default compose<Props, NewQueryFragmentFormSectionProps>(
  injectIntl,
  injectDrawer,
  injectFeatures,
)(NewQueryFragmentFormSection);
