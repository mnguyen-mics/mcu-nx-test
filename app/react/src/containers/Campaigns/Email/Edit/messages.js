import { defineMessages } from 'react-intl';

export default defineMessages({
  savingInProgress: {
    id: 'message.loading.content.saving-in-progress',
    defaultMessage: 'Saving in progress',
  },
  emailEditorBreadcrumbTitle1: {
    id: 'emailEditor.breadcrumb.title1',
    defaultMessage: 'Email Campaigns',
  },
  emailEditorBreadcrumbNewCampaignTitle: {
    id: 'emailEditor.breadcrumb.new-campaign',
    defaultMessage: 'New Campaign',
  },
  emailEditorBreadcrumbEditCampaignTitle: {
    id: 'emailEditor.breadcrumb.edit-campaign',
    defaultMessage: 'Edit {campaignName}',
  },
  emailEditorSaveCampaign: {
    id: 'emailEditor.button.save_campaign',
    defaultMessage: 'Save Campaign',
  },
  emailEditorGeneralInformationTitle: {
    id: 'emailEditor.step.title.general_information',
    defaultMessage: 'General Information',
  },
  emailEditorGeneralInformationSubTitle: {
    id: 'emailEditor.step.subtitle.general_information',
    defaultMessage: 'Give your campaign a name and a technical name',
  },
  emailEditorNameInputLabel: {
    id: 'emailEditor.step.input.label.campaign_name',
    defaultMessage: 'Name',
  },
  emailEditorNameInputPlaceholder: {
    id: 'emailEditor.step.input.placeholder.campaign_name',
    defaultMessage: 'Give your Campaign a name',
  },
  emailEditorNameInputHelper: {
    id: 'emailEditor.step.input.helper.campaign_name',
    defaultMessage: 'Give your Campaign a name and make it as memorable as you can. It will be displayed accorss all the screens.',
  },
  emailEditorTechnicalNameInputLabel: {
    id: 'emailEditor.step.input.label.campaign_technical_name',
    defaultMessage: 'Technical name',
  },
  emailEditorTechnicalNameInputPlaceholder: {
    id: 'emailEditor.steps.general.name_placeholder',
    defaultMessage: 'Give your Campaign a Technical Name',
  },
  emailEditorTechnicalNameInputHelper: {
    id: 'emailEditor.steps.general.name_helper',
    defaultMessage: 'Give your Campaign a Technical Name if you need (can be useful when using integrations)',
  },
  emailEditorRouterTitle: {
    id: 'emailEditor.step.title.router',
    defaultMessage: 'Router',
  },
  emailEditorRouterSubTitle: {
    id: 'emailEditor.step.subtitle.router',
    defaultMessage: 'The router you select will be the same for all blast. You can use only one router per campaign.',
  },
  emailEditorRouterSelectLabel: {
    id: 'emailEditor.step.select.label.router',
    defaultMessage: 'Router',
  },
  emailEditorRouterSelectHelper: {
    id: 'emailEditor.step.select.helper.router',
    defaultMessage: 'Choose your Router. A Router is basically a channel through which you will send your email.',
  },
  emailEditorProviderSelectLabel: {
    id: 'emailEditor.step.select.label.provider',
    defaultMessage: 'Provider',
  },
  emailEditorProviderSelectHelper: {
    id: 'emailEditor.step.select.helper.provider',
    defaultMessage: 'A Provider helps you target the user that have given you an explicit consent on being targeted by email',
  },
  emailEditorEmailBlastTitle: {
    id: 'emailEditor.step.title.email_blast',
    defaultMessage: 'Email Blasts',
  },
  emailEditorEmailBlastSubTitle: {
    id: 'emailEditor.step.subtitle.email_blast',
    defaultMessage: 'Add a Blast to your Campaign. A Blast has a send date and a template and is sent to a particular Audience.',
  },
  emailEditorEmailBlastEmpty: {
    id: 'emailEditor.email_blast.no-blast',
    defaultMessage: 'No blast yet, please add a blast',
  },
  segmentSelectionTitle: {
    id: 'emailBlastEditor.title.segment',
    defaultMessage: 'Audience Segments',
  },
  segmentSelectionSubTitle: {
    id: 'emailBlastEditor.subtitle.segment',
    defaultMessage: 'Configure segments for your campaign',
  },
  segmentSelectionChooseExisting: {
    id: 'emailBlastEditor.segment.choose_existing',
    defaultMessage: 'Choose existing',
  },
  emailBlastEditorBreadcrumbTitleNewBlast: {
    id: 'emailBlastEditor.breadcrumb.title.new_blast',
    defaultMessage: 'New blast',
  },
  emailBlastEditorBreadcrumbTitleEditBlast: {
    id: 'emailBlastEditor.breadcrumb.title.edit_blast',
    defaultMessage: 'Edit {blastName}',
  },
  emailBlastEditorStepperGeneralInformation: {
    id: 'emailBlastEditor.stepper.general_information',
    defaultMessage: 'General Information',
  },
  emailBlastEditorStepperBlastInformation: {
    id: 'emailBlastEditor.stepper.blast_information',
    defaultMessage: 'Blast Information',
  },
  emailBlastEditorStepperTemplateSelection: {
    id: 'emailBlastEditor.stepper.template_selection',
    defaultMessage: 'Template Selection',
  },
  emailBlastEditorStepperSegmentSelection: {
    id: 'emailBlastEditor.stepper.segment_selection',
    defaultMessage: 'Segment Selection',
  },
  emailBlastEditorStepTitleGeneralInformation: {
    id: 'emailBlastEditor.step.title.general_information',
    defaultMessage: 'General Information',
  },
  emailBlastEditorStepSubTitleGeneralInformation: {
    id: 'emailBlastEditor.step.subtitle.general_information',
    defaultMessage: 'Provide blast name and a scheduled date of execution',
  },
  emailBlastEditorInputLabelBlastName: {
    id: 'emailBlastEditor.input.label.blast_name',
    defaultMessage: 'Blast name',
  },
  emailBlastEditorInputPlaceholderBlastName: {
    id: 'emailBlastEditor.input.placeholder.blast_name',
    defaultMessage: 'Enter blast name',
  },
  emailBlastEditorInputHelperBlastName: {
    id: 'emailBlastEditor.input.helper.blast_name',
    defaultMessage: 'The blast name will reflect accross all the screen so make it memorable!',
  },
  emailBlastEditorDatePickerLabelSentDate: {
    id: 'emailBlastEditor.datepicker.label.send_date',
    defaultMessage: 'Send date',
  },
  emailBlastEditorDatePickerPlaceholderSentDate: {
    id: 'emailBlastEditor.datepicker.placeholder.send_date',
    defaultMessage: 'Select date',
  },
  emailBlastEditorDatePickerHelperSentDate: {
    id: 'emailBlastEditor.datepicker.helper.send_date',
    defaultMessage: 'This is the date at which your Blast will be sent',
  },
  emailBlastEditorStepTitleBlastInformation: {
    id: 'emailBlastEditor.step.title.blast_information',
    defaultMessage: 'Blast Information',
  },
  emailBlastEditorStepSubTitleBlastInformation: {
    id: 'emailBlastEditor.step.subtitle.blast_information',
    defaultMessage: 'Provide configuration details',
  },
  emailBlastEditorStepTitleTemplateSelection: {
    id: 'emailBlastEditor.step.title.template_selection',
    defaultMessage: 'Template Selection',
  },
  emailBlastEditorStepSubTitleTemplateSelection: {
    id: 'emailBlastEditor.step.subtitle.template_selection',
    defaultMessage: 'Select an email template for your blast',
  },
  emailBlastEditorInputLabelSubjectLine: {
    id: 'emailBlastEditor.input.label.subject_line',
    defaultMessage: 'Subject',
  },
  emailBlastEditorInputHelperSubjectLine: {
    id: 'emailBlastEditor.input.helper.subject_line',
    defaultMessage: 'Your Subject is what your audience will see first when the open their mailbox. So make it catchy!',
  },
  emailBlastEditorInputPlaceholderSubjectLine: {
    id: 'emailBlastEditor.input.placeholder.subject_line',
    defaultMessage: 'Enter email subject',
  },
  emailBlastEditorInputLabelFromEmail: {
    id: 'emailBlastEditor.input.label.from_email',
    defaultMessage: 'From email',
  },
  emailBlastEditorInputHelperFromEmail: {
    id: 'emailBlastEditor.input.helper.from_email',
    defaultMessage: 'The From email is the email address your audience will receive the mail from.',
  },
  emailBlastEditorInputPlaceholderFromEmail: {
    id: 'emailBlastEditor.input.placeholder.from_email',
    defaultMessage: 'Enter from email',
  },
  emailBlastEditorInputLabelFromName: {
    id: 'emailBlastEditor.input.label.from_name',
    defaultMessage: 'From name',
  },
  emailBlastEditorInputHelperFromName: {
    id: 'emailBlastEditor.input.helper.from_name',
    defaultMessage: 'The From Name is the Name your audience will receive the mail from.',
  },
  emailBlastEditorInputPlaceholderFromName: {
    id: 'emailBlastEditor.input.placeholder.from_name',
    defaultMessage: 'Enter from name',
  },
  emailBlastEditorInputLabelReplyTo: {
    id: 'emailBlastEditor.input.label.reply_to',
    defaultMessage: 'Reply to',
  },
  emailBlastEditorInputHelperReplyTo: {
    id: 'emailBlastEditor.input.helper.reply_to',
    defaultMessage: 'The reply to email is the email address your audience will be able to reply to from the email you are about to send.',
  },
  emailBlastEditorInputPlaceholderReplyTo: {
    id: 'emailBlastEditor.input.placeholder.reply_to',
    defaultMessage: 'Enter reply to',
  },
  blastTemplateSelectionSelectButton: {
    id: 'blastTemplateSelection.button.select_template',
    defaultMessage: 'Select Template',
  },
  blastTemplateSelectionEmpty: {
    id: 'blastTemplateSelection.empty',
    defaultMessage: 'No template selected yet',
  },
  blastTemplateSelectionRequired: {
    id: 'blastTemplateSelection.required',
    defaultMessage: 'A template is required',
  },
  blastTemplateAddButton: {
    id: 'blastTemplate.addButton',
    defaultMessage: 'Add',
  },
  blastTemplateSelectButton: {
    id: 'blastTemplate.selectButton',
    defaultMessage: 'Select',
  },
  blastTemplateSelectedButton: {
    id: 'blastTemplate.selectedButton',
    defaultMessage: 'Selected !',
  },
  blastSegmentSelectionEmpty: {
    id: 'blastSegmentSelection.empty',
    defaultMessage: 'No Segment selected yet',
  },
  blastSegmentSelectionRequired: {
    id: 'blastSegmentSelection.required',
    defaultMessage: 'At least one segment is required',
  },
});
