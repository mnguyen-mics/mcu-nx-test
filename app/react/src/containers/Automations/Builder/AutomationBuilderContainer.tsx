import * as React from 'react';
import { compose } from 'recompose';
import { /*message,*/ Layout } from 'antd';
import { connect } from 'react-redux';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import AutomationBuilder from './AutomationBuilder';
import { StorylineNodeModel, storylineNodeData } from './domain';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import AutomationActionBar from './ActionBar/AutomationActionBar';
import { AutomationFormData, INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { ScenarioNodeShape } from '../../../models/automations/automations';
import { isQueryInputNode } from './AutomationNode/Edit/domain';

export interface AutomationBuilderContainerProps {
  datamartId: string;
  automationFormData?: Partial<AutomationFormData>;
  editionLayout?: boolean;
  saveOrUpdate: (formData: Partial<AutomationFormData>) => void;
  onClose?: () => void;
}

type Props = AutomationBuilderContainerProps &
  InjectedNotificationProps &
  InjectedIntlProps;

interface State {
  automationTreeData: StorylineNodeModel;
}

class AutomationBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      automationTreeData:
        props.automationFormData && props.automationFormData.automationTreeData
          ? props.automationFormData.automationTreeData
          : INITIAL_AUTOMATION_DATA.automationTreeData,
    };
  }

  // TODO: merge handleUpdateAutomationData and handleQueryNodeData

  handleUpdateAutomationData = (
    newAutomationData: StorylineNodeModel,
  ): StorylineNodeModel => {
    this.setState({
      automationTreeData: newAutomationData,
    });
    return newAutomationData;
  };

  handleQueryNodeData = (nodeId: string, queryText: string) => {
    const { automationTreeData } = this.state;
    let updatedBeginNode: ScenarioNodeShape;
    if (
      automationTreeData.node.id === nodeId &&
      isQueryInputNode(automationTreeData.node)
    ) {
      updatedBeginNode = {
        ...automationTreeData.node,
        query_text: queryText,
      };
    }
    const iterate = (treeData: StorylineNodeModel): StorylineNodeModel => {
      const outEdges = treeData.out_edges.map((child, index) => {
        if (child.node.id === nodeId) {
          const updatedNode = {
            ...child.node,
            query_text: queryText,
          };
          return {
            node: updatedNode,
            in_edge: child.in_edge,
            out_edges: child.out_edges,
          };
        } else {
          return iterate(child);
        }
      });
      return {
        node: treeData.node.id === nodeId ? updatedBeginNode : treeData.node,
        in_edge: treeData.in_edge,
        out_edges: outEdges,
      };
    };

    this.setState({
      automationTreeData: iterate(automationTreeData),
    });
  };

  saveOrUpdate = (formData: AutomationFormData) => {
    const { automationFormData, editionLayout } = this.props;
    if (editionLayout && automationFormData) {
      this.props.saveOrUpdate({
        automation: automationFormData.automation,
        automationTreeData: this.state.automationTreeData,
      });
    } else {
      this.props.saveOrUpdate(formData);
    }
  };

  render() {
    const {
      datamartId,
      editionLayout,
      onClose,
      automationFormData,
    } = this.props;
    const { automationTreeData } = this.state;

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        <Layout className={editionLayout ? 'edit-layout' : ''}>
          <AutomationActionBar
            automationData={{
              automation: automationFormData && automationFormData.automation,
              automationTreeData: automationTreeData,
            }}
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
              updateQueryNode={this.handleQueryNodeData}
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
