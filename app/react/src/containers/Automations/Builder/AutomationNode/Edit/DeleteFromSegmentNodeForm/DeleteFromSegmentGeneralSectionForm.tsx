import * as React from 'react';
import { AddToSegmentAutomationFormData } from "../domain";
import { InjectedIntlProps, injectIntl, defineMessages } from "react-intl";
import { ValidatorProps } from "../../../../../../components/Form/withValidators";
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { AudienceSegmentShape } from '../../../../../../models/audiencesegment';
import { compose } from 'recompose';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  withValidators,
  FormSection,
  FormInput,
  FormInputField,
} from '../../../../../../components/Form';

interface State {
  fetchingAudienceSegments: boolean;
  userListSegment: AudienceSegmentShape[]
}

interface DeleteFromSegmentGeneralSectionFormProps {
  initialValues: Partial<AddToSegmentAutomationFormData>;
  organisationId: string;
  disabled?: boolean;
}

type Props = DeleteFromSegmentGeneralSectionFormProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class DeleteFromSegmentGeneralSectionForm extends React.Component<Props, State> {

  @lazyInject(TYPES.IAudienceSegmentService)
  private audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    this.state = {
      fetchingAudienceSegments: false,
      userListSegment: []
    };
  }

  componentDidMount() {
    this.setState({ fetchingAudienceSegments: true, });
    this.audienceSegmentService
      .getSegments(this.props.organisationId, {
        type: "USER_LIST",
      })
      .then(userListSegmentsResponse => {
        this.setState({
          fetchingAudienceSegments: false,
          userListSegment: userListSegmentsResponse.data
        });
      });
  }

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
        <div className="automation-node-form">
          <FormInputField
            name="name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(
                messages.audienceSegmentNameTitle, 
              ),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.audienceSegmentNamePlaceholder,
              ),
              disabled: !!disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.audienceSegmentNameSubtitle),
            }}
            small={true}
          />
        </div>
      </div>
    )
  }
}

export default compose<Props, DeleteFromSegmentGeneralSectionFormProps>(
  injectIntl,
  withValidators,
  withNormalizer,
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
    defaultMessage: 'This is the audience segment name',
  },
  audienceSegmentNameSubtitle: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.subtitle',
    defaultMessage: "The audience segment's name will help you identify it on the different screens. Make it as memorable as you want your results to be !",
  },
  audienceSegmentNamePlaceholder: {
    id: 'automation.builder.node.deleteFromSegmentForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
});