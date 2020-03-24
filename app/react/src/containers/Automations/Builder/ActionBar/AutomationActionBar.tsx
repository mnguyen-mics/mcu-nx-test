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
import { Button } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import AutomationSimpleForm, {
  FORM_ID,
  AutomationSimpleFormData,
} from './AutomationSimpleForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AutomationFormData, INITIAL_AUTOMATION_DATA } from '../../Edit/domain';
import { McsIcon } from '../../../../components';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

interface AutomationActionBarProps {
  automationData?: Partial<AutomationFormData>;
  saveOrUpdate: (formData: Partial<AutomationFormData>) => void;
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
      exitCondition:
        automationData && automationData.exitCondition
          ? automationData.exitCondition
          : INITIAL_AUTOMATION_DATA.exitCondition,
      automationTreeData:
        automationData && automationData.automationTreeData
          ? automationData.automationTreeData
          : INITIAL_AUTOMATION_DATA.automationTreeData,
    };
    saveOrUpdate(formData);
  };

  render() {
    const {
      intl,
      submit,
      automationData,
      match: {
        params: { automationId },
      },
    } = this.props;

    const { visible } = this.state;

    const initialFormData: Partial<AutomationSimpleFormData> = {
      name:
        automationData && automationData.automation
          ? automationData.automation.name
          : '',
    };

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
        <Button className="mcs-primary" type="primary" onClick={this.onClick}>
          <McsIcon type={"plus"} /> 
          {automationId
            ? intl.formatMessage(messages.updateAutomation)
            : intl.formatMessage(messages.saveAutomation)}
        </Button>
        
       {visible && (
          <AutomationSimpleForm
            onSubmit={this.onSave}
            initialValues={initialFormData}
            visible={visible}
            onClose={this.handleModal}
            onHandleOk={handleOnOk}
          />
        )}
      </ActionBar>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
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
