import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import { Button } from 'antd';
import { FormSection } from '../../../../components/Form';
import AutomationBuilderContainer, {
  AutomationBuilderContainerProps,
} from '../../Builder/AutomationBuilderContainer';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { INITIAL_AUTOMATION_DATA, AutomationFormData } from '../domain';

interface AutomationPreviewFormSectionProps extends ReduxFormChangeProps {
  datamartId: string;
  automationFormData: Partial<AutomationFormData>;
}

type Props = AutomationPreviewFormSectionProps &
  InjectedIntlProps &
  InjectedDrawerProps;

class AutomationPreviewFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  update = (formData: AutomationFormData) => {
    this.props.formChange('automationTreeData', formData.automationTreeData);
    this.props.closeNextDrawer();
  };

  onClose = () => {
    this.props.closeNextDrawer();
  };

  openEditor = () => {
    const { automationFormData } = this.props;
    this.props.openNextDrawer<AutomationBuilderContainerProps>(
      AutomationBuilderContainer,
      {
        additionalProps: {
          datamartId: this.props.datamartId,
          editionLayout: true,
          onClose: this.onClose,
          automationFormData: automationFormData
            ? automationFormData
            : INITIAL_AUTOMATION_DATA,
          saveOrUpdate: this.update,
        },
      },
    );
  };

  render() {
    return (
      <div>
        <FormSection
          subtitle={messages.sectionAutomationPreviewSubTitle}
          title={messages.sectionAutomationPreviewTitle}
        />
        <div className="text-center m-t-20">
          <Button onClick={this.openEditor}>
            {this.props.intl.formatMessage({
              id: 'jsonql.button.query.edit',
              defaultMessage: 'Edit Automation',
            })}
          </Button>
        </div>
      </div>
    );
  }
}

export default compose<Props, AutomationPreviewFormSectionProps>(
  injectIntl,
  injectDrawer,
)(AutomationPreviewFormSection);
