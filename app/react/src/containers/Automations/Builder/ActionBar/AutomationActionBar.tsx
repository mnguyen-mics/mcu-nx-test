import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { submit as rxfSubmit, getFormValues } from 'redux-form';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  messages,
  AutomationBuilderPageRouteParams,
} from '../AutomationBuilderPage';
import ActionBar from '../../../../components/ActionBar';
import { Button, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import AutomationSimpleForm, {
  FORM_ID,
  AutomationSimpleFormData,
} from './AutomationSimpleForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { McsIcon } from '../../../../components';
import { AutomationFormData, INITIAL_AUTOMATION_DATA } from '../../Edit/domain';

interface AutomationActionBarProps {
  automationData?: Partial<AutomationFormData>;
  saveOrUpdate: (formData: Partial<AutomationFormData>) => void;
  onClose?: () => void;
  editMode: boolean;
  handleEditMode: () => void;
}

interface State {
  isLoading: boolean;
  visible: boolean;
}

interface MapDispatchToProps {
  submit: (formId: string) => void;
}

interface MapStateToProps {
  formValues: AutomationSimpleFormData;
}

type Props = AutomationActionBarProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  MapDispatchToProps &
  MapStateToProps &
  RouteComponentProps<AutomationBuilderPageRouteParams>;

class AutomationActionBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      visible: false,
    };
  }

  onClick = () => {
    this.handleModal();
  };

  editAutomation = () => {
    this.props.handleEditMode();
  };

  handleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  onSave = () => {
    const { saveOrUpdate, automationData, formValues } = this.props;
    const formData: AutomationFormData = {
      automation: automationData
        ? {
            ...automationData.automation,
            ...formValues,
          }
        : {
            ...formValues,
          },
      automationTreeData:
        automationData && automationData.automationTreeData
          ? automationData.automationTreeData
          : INITIAL_AUTOMATION_DATA.automationTreeData,
    };
    saveOrUpdate(formData);
  };

  render() {
    const { intl, submit, onClose, automationData, editMode } = this.props;

    const { isLoading, visible } = this.state;

    const handleOnOk = () => {
      submit(FORM_ID);
    };

    return (
      <ActionBar
        paths={[
          {
            name: intl.formatMessage(messages.automationBuilder),
          },
          {
            name:
              automationData &&
              automationData.automation &&
              automationData.automation.name
                ? automationData.automation.name
                : intl.formatMessage(messages.newAutomation),
          },
        ]}
      >
        {editMode ? (
          <Button className="mcs-primary" type="primary" onClick={this.onClick}>
            {intl.formatMessage(messages.saveAutomation)}
          </Button>
        ) : (
          <Button
            className="mcs-primary"
            type="primary"
            onClick={this.editAutomation}
          >
            <McsIcon type="pen" /> {intl.formatMessage(messages.editAutomation)}
          </Button>
        )}
        {editMode && (
          <McsIcon
            type="close"
            className="close-icon"
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
        )}
        <Modal
          visible={visible}
          onOk={handleOnOk}
          onCancel={this.handleModal}
          confirmLoading={isLoading}
          title={
            <FormattedMessage
              id="automation.builder.page.actionbar.modal.title"
              defaultMessage="Save Automation"
            />
          }
        >
          {visible && <AutomationSimpleForm onSubmit={this.onSave} />}
        </Modal>
      </ActionBar>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AutomationActionBarProps>(
  injectIntl,
  injectNotifications,
  withRouter,
  connect(mapStateToProps),
  connect(
    undefined,
    { submit: rxfSubmit },
  ),
)(AutomationActionBar);
