import * as React from 'react';
import { OnSegmentEntryInputAutomationFormData } from "../domain";
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

interface OnSegmentEntryInputGeneralSectionFormProps {
  initialValues: Partial<OnSegmentEntryInputAutomationFormData>;
  disabled?: boolean;
}

type Props = OnSegmentEntryInputGeneralSectionFormProps &
  InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class OnSegmentEntryInputGeneralSectionForm extends React.Component<
  Props,
  State
> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _SegmentEntryInputService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
  }

  fetchListMethod = (keywords: string) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    return this._SegmentEntryInputService
      .getSegments(organisationId, { keywords, type: 'USER_QUERY', persisted: true })
      .then(({ data: segments }) =>
        segments.map(r => ({
          key: r.id,
          label: <SegmentNameDisplay audienceSegmentResource={r} />,
        })),
      );
  };

  fetchSingleMethod = (id: string) => {
    return this._SegmentEntryInputService.getSegment(id).then(({ data: segment }) => ({
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
            label: formatMessage(messages.SegmentEntryInputNameTitle),
            required: true,
          }}
          fetchListMethod={this.fetchListMethod}
          fetchSingleMethod={this.fetchSingleMethod}
          helpToolTipProps={{
            title: formatMessage(messages.SegmentEntryInputNameSubtitle),
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

export default compose<Props, OnSegmentEntryInputGeneralSectionFormProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(OnSegmentEntryInputGeneralSectionForm);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.generalInfoSection.title',
    defaultMessage: 'Enter Automation - On audience segment entry',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.general.subtitle',
    defaultMessage: 'Modify the segment to be used for this automation',
  },
  automationNodeName: {
    id: 'automation.builder.node.onSegmentEntryInputForm.name',
    defaultMessage: 'Automation node name',
  },
  SegmentEntryInputNameTitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.name.title',
    defaultMessage: 'Select the segment which will be used for entering the automation',
  },
  SegmentEntryInputNameSubtitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.name.subtitle',
    defaultMessage: "When users are entering the segment, they will also enter the automation.",
  },
  SegmentEntryInputNamePlaceholder: {
    id: 'automation.builder.node.onSegmentEntryInputForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
});