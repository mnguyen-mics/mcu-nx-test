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
import NewAudienceFeatureFormSection, {
  NewAudienceFeatureFormSectionProps,
} from './NewAudienceFeatureFormSection';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import {
  AudienceBuilderParametricPredicateNode,
  AudienceBuilderParametricPredicateGroupNode,
} from '../../../../models/audienceBuilder/AudienceBuilderResource';

export interface TimelineConfiguration {
  titlePart1: ReactIntl.FormattedMessage.MessageDescriptor;
  titlePart2: ReactIntl.FormattedMessage.MessageDescriptor;
  initialDotColor: string;
  actionDotColor: string;
}

export const NewAudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  NewAudienceFeatureFormSectionProps
>;

export interface NewQueryFragmentFormSectionProps {
  datamartId: string;
  demographicsFeaturesIds: string[];
  timelineConfiguration: TimelineConfiguration;
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

  // ----------------------------------
  // Utilities

  private addToGroup = (groupIndex: number) => (
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

  // ----------------------------------
  // Rendering

  private renderGroupTitle = (index: number) => {
    const { intl, timelineConfiguration } = this.props;

    const titlePart1 = timelineConfiguration.titlePart1;
    const titlePart2 = timelineConfiguration.titlePart2;

    return (
      <div className="mcs-timeline_title">
        {index !== 0 && (
          <span className="mcs-timeline_title_highlight">
            {intl.formatMessage(
              messages.audienceBuilderTimelineMatchingCriterias0,
            )}
          </span>
        )}

        {intl.formatMessage(titlePart1)}

        <span className="mcs-timeline_title_highlight">
          {intl.formatMessage(titlePart2)}
        </span>
      </div>
    );
  };

  render() {
    const {
      fields,
      intl,
      datamartId,
      demographicsFeaturesIds,
      objectTypes,
      timelineConfiguration,
      selectAndAddFeature,
    } = this.props;

    const { audienceFeatures } = this.props;

    const showCriteriaHelper = (index: number): boolean => {
      return index === 0 && fields.get(index).expressions.length < 2;
    };

    const removeGroup = (index: number) => () => {
      fields.remove(index);
    };

    const initialDotStyle =
      'mcs-timeline_initialDot ' + timelineConfiguration.initialDotColor;
    const actionDotStyle =
      'mcs-timeline_actionDot ' + timelineConfiguration.actionDotColor;

    return (
      <React.Fragment>
        <div className="mcs-timeline">
          {fields.map((name, index) => {
            return (
              <React.Fragment key={`${index}_${fields.length}`}>
                <div className="mcs-timeline_group">
                  <Timeline.Item
                    dot={<McsIcon type="status" className={initialDotStyle} />}
                  >
                    {this.renderGroupTitle(index)}

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
                    dot={
                      <Button
                        className={actionDotStyle}
                        onClick={selectAndAddFeature(this.addToGroup(index))}
                      >
                        +
                      </Button>
                    }
                  >
                    {showCriteriaHelper(index) ? (
                      <div className="mcs-timeline_dotTitle">
                        {intl.formatMessage(
                          messages.audienceBuilderTimelineAddCriteria,
                        )}
                      </div>
                    ) : (
                      <div className="mcs-timeline_dotNoTitle"/>
                    )}
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
