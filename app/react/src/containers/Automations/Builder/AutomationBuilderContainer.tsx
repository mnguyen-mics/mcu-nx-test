import * as React from 'react';
import { compose } from 'recompose';
import { /*message,*/ Layout } from 'antd';
import { connect } from 'react-redux';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import AutomationBuilder from './AutomationBuilder';
import { AutomationResource } from '../../../models/automations/automations';
import {
  StorylineNodeModel,
  storylineNodeData,
  storylineResourceData,
  storylineEdgeData,
  buildAutomationTreeData,
} from './domain';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import AutomationActionBar from './ActionBar/AutomationActionBar';
import { AutomationFormData } from '../Edit/domain';

export interface AutomationBuilderContainerProps {
  datamartId: string;
  automationTreeData?: StorylineNodeModel;
  editionLayout?: boolean;
  saveOrUpdate: (formData: AutomationFormData | StorylineNodeModel) => void;
  onClose?: () => void;
}

interface State {
  automation?: AutomationResource;
  automationTreeData?: StorylineNodeModel;
  loading: boolean;
}

type Props = AutomationBuilderContainerProps &
  InjectedNotificationProps &
  InjectedIntlProps;

class AutomationBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      automationTreeData: !props.automationTreeData
        ? buildAutomationTreeData(
            storylineResourceData,
            storylineNodeData,
            storylineEdgeData,
          )
        : props.automationTreeData,
    };
  }

  handleUpdateAutomationData = (
    newAutomationData: StorylineNodeModel,
  ): StorylineNodeModel => {
    this.setState({
      automationTreeData: newAutomationData,
    });
    return newAutomationData;
  };

  saveOrUpdate = () => {
    const { automationTreeData } = this.state;
    if (automationTreeData) {
      this.props.saveOrUpdate(automationTreeData);
    }
  };

  render() {
    const { datamartId, editionLayout, onClose } = this.props;

    const { automation, automationTreeData } = this.state;
    return (
      <div style={{ height: '100%', display: 'flex' }}>
        <Layout className={editionLayout ? 'edit-layout' : ''}>
          <AutomationActionBar
            datamartId={datamartId}
            automation={automation}
            edition={editionLayout}
            saveOrUpdate={this.saveOrUpdate}
            onClose={onClose}
          />
          <Layout.Content
            className={`mcs-content-container ${
              editionLayout ? 'flex-basic' : ''
            }`}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <AutomationBuilder
              datamartId={datamartId}
              automationTreeData={automationTreeData}
              scenarioId={storylineNodeData[0].scenario_id}
              updateAutomationData={this.handleUpdateAutomationData}
            />
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default compose<Props, AutomationBuilderContainerProps>(
  injectIntl,
  injectNotifications,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
