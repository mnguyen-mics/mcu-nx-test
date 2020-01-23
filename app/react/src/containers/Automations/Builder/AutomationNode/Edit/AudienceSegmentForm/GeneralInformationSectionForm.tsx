import * as React from 'react';
import { AudienceSegmentAutomationFormData } from "../domain";
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
  FormInputField
} from '../../../../../../components/Form';

export const formMessages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.audienceSegmentForm.generalInfoSection.title',
    defaultMessage: 'General information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.audienceSegmentForm.general.subtitle',
    defaultMessage: 'Modify the general information of your audience segment',
  },
  automationNodeName: {
    id: 'automation.builder.node.audienceSegmentForm.name',
    defaultMessage: 'Automation node name',
  },
  AudienceSegmentTitle: {
    id: 'automation.builder.node.audienceSegmentForm.placeholder.title',
    defaultMessage: 'This is the audience segment name',
  },
  AudienceSegmentSubTitle: {
    id: 'automation.builder.node.audienceSegmentForm.placeholder.subtitle',
    defaultMessage: "The audience segment's name will help you identify it on the different screens. Make it as memorable as you want your results to be!",
  },
  AudienceSegmentFormPlaceholderSegmentName: {
    id: 'automation.builder.node.audienceSegmentForm.placeholder.name',
    defaultMessage: 'This is a segment name',
  },
 
});


interface State {
  fetchingAudienceSegments: boolean;
  userListSegment: AudienceSegmentShape[]
}

interface GeneralInformationFormSectionProps {
  initialValues: Partial<AudienceSegmentAutomationFormData>;
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class GeneralInformationFormSection extends React.Component<Props, State> {

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
          subtitle={formMessages.sectionGeneralSubtitle}
          title={formMessages.sectionGeneralTitle}
        />
        <div className="automation-node-form">
          <FormInputField
            name="audienceSegment.name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(
                formMessages.AudienceSegmentTitle, 
              ),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                formMessages.AudienceSegmentFormPlaceholderSegmentName,
              ),
              disabled: !!disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(formMessages.AudienceSegmentSubTitle),
            }}
            small={true}
          />

        </div>

      </div>
    )
  }
}

export default compose<Props, GeneralInformationFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralInformationFormSection);

