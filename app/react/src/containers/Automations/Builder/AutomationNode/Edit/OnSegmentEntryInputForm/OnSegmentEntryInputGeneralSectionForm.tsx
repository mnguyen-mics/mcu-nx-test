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
import injectNotifications, { InjectedNotificationProps } from '../../../../../Notifications/injectNotifications';

interface State {}

interface OnSegmentEntryInputGeneralSectionFormProps {
  initialValues: Partial<OnSegmentEntryInputAutomationFormData>;
  disabled?: boolean;
}

type Props = OnSegmentEntryInputGeneralSectionFormProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class OnSegmentEntryInputGeneralSectionForm extends React.Component<
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
      initialValues: {
        datamartId
      },
      notifyError,
    } = this.props;

    return Promise.all([
      this._audienceSegmentService
      .getSegments(
        organisationId, 
        { keywords, type: ['USER_QUERY'], persisted: true, datamart_id: datamartId }
      ),
      this._audienceSegmentService
      .getSegments(
        organisationId, 
        { keywords, type: ['USER_LIST'], feed_type:'FILE_IMPORT', persisted: true, datamart_id: datamartId }
      )
    ]).then(([{ data: userQuerySegments }, { data: userListSegments }]) => {
      return userQuerySegments.concat(userListSegments).map(segment => ({
        key: segment.id,
        label: <SegmentNameDisplay audienceSegmentResource={segment} />,
      }));
    }).catch(error => {
      notifyError(error);
      return [];
    });
  };

  fetchSingleMethod = (id: string) => {
    return this._audienceSegmentService.getSegment(id).then(({ data: segment }) => ({
      key: segment.id,
      label: <SegmentNameDisplay audienceSegmentResource={segment} />,
    })).catch(error => {
      this.props.notifyError(error);
      throw error;
    });
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
  injectNotifications,
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