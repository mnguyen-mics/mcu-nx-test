import * as React from 'react';
import { DeleteFromSegmentAutomationFormData, isAddToSegmentNode } from '../domain';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { compose } from 'recompose';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { withValidators, FormSection } from '../../../../../../components/Form';
import { FormSearchObjectField } from '../../../../../QueryTool/JSONOTQL/Edit/Sections/Field/FieldNodeForm';
import FormSearchObject from '../../../../../../components/Form/FormSelect/FormSearchObject';
import { SegmentNameDisplay } from '../../../../../Audience/Common/SegmentNameDisplay';
import { RouteComponentProps, withRouter } from 'react-router';
import { StorylineNodeModel } from '../../../domain';
import { AddToSegmentNodeResource } from '../../../../../../models/automations/automations';
import { isFakeId } from '../../../../../../utils/FakeIdHelper';
import { LabeledValue } from 'antd/lib/select';

interface State {}

interface DeleteFromSegmentGeneralSectionFormProps {
  initialValues: Partial<DeleteFromSegmentAutomationFormData>;
  storylineNodeModel: StorylineNodeModel;
  scenarioNodes: StorylineNodeModel[];
  disabled?: boolean;
}

type Props = DeleteFromSegmentGeneralSectionFormProps &
  InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class DeleteFromSegmentGeneralSectionForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
  }

  fetchListMethod = (keywords: string) => {
    const {
      match: {
        params: { organisationId },
      },
      storylineNodeModel,
      scenarioNodes,
    } = this.props;

    return this._audienceSegmentService
      .getSegments(organisationId, {
        keywords,
        type: ['USER_LIST'],
        feed_type: 'SCENARIO',
      })
      .then(({ data: segments }) =>
        this.findPreviousAddToSegmentNodes(storylineNodeModel, scenarioNodes)
          .map(r => ({
            key: r.formData.audienceSegmentId || '',
            label: <label>{r.formData.audienceSegmentName || ''}</label>,
            value: r.formData.audienceSegmentId || '',
          }))
          .concat(
            segments.map(r => ({
              key: r.id,
              label: <SegmentNameDisplay audienceSegmentResource={r} />,
              value: r.id,
            })),
          ),
      );
  };

  findPreviousAddToSegmentNodes = (
    storylineNodeModel: StorylineNodeModel,
    scenarioNodes: StorylineNodeModel[],
  ): AddToSegmentNodeResource[] => {
    const findPreviousAddToSegmentNodesRec = (
      storylineNodeModelRec: StorylineNodeModel,
      list: AddToSegmentNodeResource[],
    ): AddToSegmentNodeResource[] => {
      const inEdge = storylineNodeModelRec.in_edge;
      if (inEdge) {
        const foundStorylineNode = scenarioNodes.find(
          storylineNode => storylineNode.node.id === inEdge.source_id,
        );
        if (foundStorylineNode) {
          if (
            isAddToSegmentNode(foundStorylineNode.node) &&
            foundStorylineNode.node.formData.audienceSegmentName &&
            foundStorylineNode.node.formData.audienceSegmentId &&
            isFakeId(foundStorylineNode.node.formData.audienceSegmentId)
          ) {
            return findPreviousAddToSegmentNodesRec(
              foundStorylineNode,
              list.concat(foundStorylineNode.node),
            );
          }
          return findPreviousAddToSegmentNodesRec(foundStorylineNode, list);
        }
      }
      return list;
    };

    return findPreviousAddToSegmentNodesRec(storylineNodeModel, []);
  };

  fetchSingleMethod = (id: string) => {
    const { scenarioNodes } = this.props;

    if (isFakeId(id)) {
      return new Promise<LabeledValue>(resolve => {
        return resolve({
          key: id,
          label: <label>{this.findSegmentName(id, scenarioNodes)}</label>,
          value: id,
        });
      });
    } else {
      return this._audienceSegmentService.getSegment(id).then(({ data: segment }) => ({
        key: segment.id,
        label: <SegmentNameDisplay audienceSegmentResource={segment} />,
        value: segment.id,
      }));
    }
  };

  findSegmentName = (audienceSegmentId: string, scenarioNodes: StorylineNodeModel[]) => {
    const addToSegmentStoryLine = scenarioNodes.find(
      storylineNode =>
        isAddToSegmentNode(storylineNode.node) &&
        audienceSegmentId === storylineNode.node.formData.audienceSegmentId,
    );
    if (addToSegmentStoryLine && isAddToSegmentNode(addToSegmentStoryLine.node)) {
      return addToSegmentStoryLine.node.formData.audienceSegmentName || '';
    }
    return '';
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />
        <FormSection title={messages.sectionGeneralConfigurationTitle} />
        <FormSearchObjectField
          name='segmentId'
          component={FormSearchObject}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.audienceSegmentNameTitle),
            required: true,
          }}
          fetchListMethod={this.fetchListMethod}
          fetchSingleMethod={this.fetchSingleMethod}
          selectProps={{
            disabled: !!disabled,
            mode: undefined,
            showSearch: true,
          }}
          type='Audience'
          small={true}
        />
      </div>
    );
  }
}

export default compose<Props, DeleteFromSegmentGeneralSectionFormProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(DeleteFromSegmentGeneralSectionForm);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.generalInfoSection.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.general.subtitle',
    defaultMessage:
      "This action allows you to delete users from a segment. If the users are not in the segment, there won't be any action and the automation will continue.",
  },
  sectionGeneralConfigurationTitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.generalInfoSection.configuration.title',
    defaultMessage: 'Configuration',
  },
  automationNodeName: {
    id: 'automation.builder.node.deleteFromSegmentForm.name',
    defaultMessage: 'Automation node name',
  },
  audienceSegmentNameTitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.title',
    defaultMessage: 'Select the segment to delete the users from',
  },
  audienceSegmentNamePlaceholder: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
});
