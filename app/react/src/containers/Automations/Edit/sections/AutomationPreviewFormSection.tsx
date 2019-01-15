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
import { StorylineNodeModel } from '../../Builder/domain';
import { AutomationFormData } from '../domain';

interface AutomationPreviewFormSectionProps extends ReduxFormChangeProps {
  datamartId: string;
  formValues: Partial<AutomationFormData>;
}

type Props = AutomationPreviewFormSectionProps &
  InjectedIntlProps &
  InjectedDrawerProps;

class AutomationPreviewFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  update = (treeData: StorylineNodeModel) => {
    this.props.formChange('automation.automationTreeData', treeData);
    this.props.closeNextDrawer();
  };

  onClose = () => {
    this.props.closeNextDrawer();
  };

  openEditor = () => {
    const { formValues } = this.props;
    this.props.openNextDrawer<AutomationBuilderContainerProps>(
      AutomationBuilderContainer,
      {
        additionalProps: {
          datamartId: this.props.datamartId,
          editionLayout: true,
          onClose: this.onClose,
          automationTreeData:
            formValues && formValues.automationTreeData
              ? formValues.automationTreeData
              : undefined,
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
