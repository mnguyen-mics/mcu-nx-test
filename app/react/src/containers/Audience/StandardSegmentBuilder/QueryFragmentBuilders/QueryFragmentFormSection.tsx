import * as React from 'react';
import { WrappedFieldArrayProps, FieldArray, GenericFieldArray, Field } from 'redux-form';
import { Button, Timeline } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../constants';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureFormSection, {
  AudienceFeatureFormSectionProps,
} from './AudienceFeatureFormSection';
import injectDrawer, { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import {
  StandardSegmentBuilderParametricPredicateNode,
  StandardSegmentBuilderGroupNode,
} from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';

export interface TimelineConfiguration {
  titlePart1: ReactIntl.FormattedMessage.MessageDescriptor;
  titlePart2: ReactIntl.FormattedMessage.MessageDescriptor;
  initialDotColor: string;
  actionDotColor: string;
}

export const AudienceFeatureFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AudienceFeatureFormSectionProps
>;

export interface QueryFragmentFormSectionProps {
  datamartId: string;
  timelineConfiguration: TimelineConfiguration;
  selectAndAddFeature: (
    addToGroup: (_: StandardSegmentBuilderParametricPredicateNode) => void,
  ) => () => void;
  change: (field: string, value: any) => void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
}

type Props = WrappedFieldArrayProps<StandardSegmentBuilderGroupNode> &
  InjectedDrawerProps &
  QueryFragmentFormSectionProps &
  InjectedFeaturesProps &
  InjectedIntlProps;

class QueryFragmentFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  // ----------------------------------
  // Utilities

  private addToGroup = (groupIndex: number) => (
    predicate: StandardSegmentBuilderParametricPredicateNode,
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
      <div className='mcs-timeline_title'>
        {index !== 0 && (
          <span className='mcs-timeline_title_highlight'>
            {intl.formatMessage(messages.standardSegmentBuilderTimelineMatchingCriterias0)}&nbsp;
          </span>
        )}
        {intl.formatMessage(titlePart1)}&nbsp;
        <span className='mcs-timeline_title_highlight'>{intl.formatMessage(titlePart2)}</span>
      </div>
    );
  };

  render() {
    const {
      fields,
      intl,
      datamartId,
      objectTypes,
      timelineConfiguration,
      selectAndAddFeature,
      change,
    } = this.props;

    const { audienceFeatures } = this.props;

    const showCriteriaHelper = (index: number): boolean => {
      return index === 0 && fields.get(index).expressions.length < 2;
    };

    const removeGroup = (index: number) => () => {
      fields.remove(index);
    };

    const initialDotStyle = 'mcs-timeline_initialDot ' + timelineConfiguration.initialDotColor;
    const actionDotStyle = 'mcs-timeline_actionDot ' + timelineConfiguration.actionDotColor;

    return (
      <React.Fragment>
        <div className='mcs-timeline'>
          {fields.map((name, index) => {
            return (
              <React.Fragment key={`${index}_${fields.length}`}>
                <div className='mcs-timeline_group'>
                  <Timeline.Item dot={<McsIcon type='status' className={initialDotStyle} />}>
                    {this.renderGroupTitle(index)}

                    <AudienceFeatureFieldArray
                      name={`${name}.expressions`}
                      component={AudienceFeatureFormSection}
                      datamartId={datamartId}
                      removeGroup={removeGroup(index)}
                      objectTypes={objectTypes}
                      audienceFeatures={audienceFeatures}
                      formChange={change}
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
                      <div className='mcs-timeline_dotTitle'>
                        {intl.formatMessage(messages.standardSegmentBuilderTimelineAddCriteria)}
                      </div>
                    ) : (
                      <div className='mcs-timeline_dotNoTitle' />
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

export default compose<Props, QueryFragmentFormSectionProps>(
  injectIntl,
  injectDrawer,
  injectFeatures,
)(QueryFragmentFormSection);
