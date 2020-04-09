import * as React from 'react';
import { DeleteFromSegmentAutomationFormData } from "../domain";
import { InjectedIntlProps, injectIntl, defineMessages } from "react-intl";
import { ValidatorProps } from "../../../../../../components/Form/withValidators";
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { compose } from 'recompose';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  withValidators,
  FormSection,
} from '../../../../../../components/Form';
import { FormSearchObjectField } from '../../../../../QueryTool/JSONOTQL/Edit/Sections/Field/FieldNodeForm';
import FormSearchObject from '../../../../../../components/Form/FormSelect/FormSearchObject';
import SegmentNameDisplay from '../../../../../Audience/Common/SegmentNameDisplay';
import { RouteComponentProps, withRouter } from 'react-router';

interface State {}

interface DeleteFromSegmentGeneralSectionFormProps {
  initialValues: Partial<DeleteFromSegmentAutomationFormData>;
  disabled?: boolean;
}

type Props = DeleteFromSegmentGeneralSectionFormProps &
  InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class DeleteFromSegmentGeneralSectionForm extends React.Component<
  Props,
  State
> {
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
    } = this.props;

    return this._audienceSegmentService
      .getSegments(organisationId, { keywords, type: 'USER_LIST', feed_type: 'SCENARIO' })
      .then(({ data: segments }) =>
        segments.map(r => ({
          key: r.id,
          label: <SegmentNameDisplay audienceSegmentResource={r} />,
        })),
      );
  };

  fetchSingleMethod = (id: string) => {
    return this._audienceSegmentService.getSegment(id).then(({ data: segment }) => ({
      key: segment.id,
      label: <SegmentNameDisplay audienceSegmentResource={segment} />,
    }));
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
        <FormSearchObjectField
          name="segmentId"
          component={FormSearchObject}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.audienceSegmentNameTitle),
            required: true,
          }}
          fetchListMethod={this.fetchListMethod}
          fetchSingleMethod={this.fetchSingleMethod}
          helpToolTipProps={{
            title: formatMessage(messages.audienceSegmentNameSubtitle),
          }}
          selectProps={{
            disabled: !!disabled,
            mode: "default",
            showSearch: true,
          }}
          type="Audience"
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
    defaultMessage: 'General information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.general.subtitle',
    defaultMessage: 'Modify the general information of your audience segment',
  },
  automationNodeName: {
    id: 'automation.builder.node.deleteFromSegmentForm.name',
    defaultMessage: 'Automation node name',
  },
  audienceSegmentNameTitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.title',
    defaultMessage: 'Select the segment to delete the users from',
  },
  audienceSegmentNameSubtitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.subtitle',
    defaultMessage: "Delete users if they exist in this segment otherwise do nothing and continue the automation.",
  },
  audienceSegmentNamePlaceholder: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
});