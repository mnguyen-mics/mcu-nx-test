import * as React from 'react';
import { OnSegmentExitInputAutomationFormData } from "../domain";
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

interface OnSegmentExitInputGeneralSectionFormProps {
  initialValues: Partial<OnSegmentExitInputAutomationFormData>;
  disabled?: boolean;
}

type Props = OnSegmentExitInputGeneralSectionFormProps &
  InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class OnSegmentExitInputGeneralSectionForm extends React.Component<
  Props,
  State
> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _SegmentExitInputService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
  }

  fetchListMethod = (keywords: string) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    return this._SegmentExitInputService
      .getSegments(organisationId, { keywords, type: 'USER_QUERY', persisted: true })
      .then(({ data: segments }) =>
        segments.map(r => ({
          key: r.id,
          label: <SegmentNameDisplay audienceSegmentResource={r} />,
        })),
      );
  };

  fetchSingleMethod = (id: string) => {
    return this._SegmentExitInputService.getSegment(id).then(({ data: segment }) => ({
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
            label: formatMessage(messages.SegmentExitInputNameTitle),
            required: true,
          }}
          fetchListMethod={this.fetchListMethod}
          fetchSingleMethod={this.fetchSingleMethod}
          helpToolTipProps={{
            title: formatMessage(messages.SegmentExitInputNameSubtitle),
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

export default compose<Props, OnSegmentExitInputGeneralSectionFormProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(OnSegmentExitInputGeneralSectionForm);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.generalInfoSection.title',
    defaultMessage: 'Enter Automation - On audience segment exit',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.general.subtitle',
    defaultMessage: 'Modify the segment to be used for this automation',
  },
  automationNodeName: {
    id: 'automation.builder.node.onSegmentExitInputForm.name',
    defaultMessage: 'Automation node name',
  },
  SegmentExitInputNameTitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.name.title',
    defaultMessage: 'Select the segment which will be used for entering the automation',
  },
  SegmentExitInputNameSubtitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.name.subtitle',
    defaultMessage: "When users are leaving the segment, they will also enter the automation.",
  },
  SegmentExitInputNamePlaceholder: {
    id: 'automation.builder.node.onSegmentExitInputForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
});