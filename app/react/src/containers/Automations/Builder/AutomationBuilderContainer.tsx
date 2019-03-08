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
import { withRouter, RouteComponentProps } from 'react-router';
import { AutomationBuilderPageRouteParams } from './AutomationBuilderPage';
import { QueryLanguage } from '../../../models/datamart/DatamartResource';
import { Loading } from '../../../components';

export interface AutomationBuilderContainerProps {
  datamartId: string;
  automationFormData?: Partial<AutomationFormData>;
  saveOrUpdate: (formData: Partial<AutomationFormData>) => void;
  loading: boolean;
  edition?: boolean;
}

type Props = AutomationBuilderContainerProps &
  InjectedNotificationProps &
  RouteComponentProps<AutomationBuilderPageRouteParams> &
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

  componentDidUpdate(prevProps: Props) {
    const { automationFormData } = this.props;
    const { automationFormData: prevAutomationFormData } = prevProps;
    if (
      automationFormData &&
      prevAutomationFormData &&
      automationFormData.automationTreeData &&
      prevAutomationFormData.automationTreeData &&
      automationFormData.automationTreeData.node &&
      prevAutomationFormData.automationTreeData.node &&
      prevAutomationFormData.automationTreeData.node.id !==
        automationFormData.automationTreeData.node.id
    ) {
      this.setState({
        automationTreeData: automationFormData.automationTreeData,
      });
    }
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
        formData: {
          query_text: JSON.stringify(queryText),
          query_language: 'JSON_OTQL' as QueryLanguage,
        },
      };
    }
    const iterate = (treeData: StorylineNodeModel): StorylineNodeModel => {
      const outEdges = treeData.out_edges.map((child, index) => {
        if (child.node.id === nodeId) {
          const updatedNode = {
            ...child.node,
            query_text: JSON.stringify(queryText),
            query_language: 'JSON_OTQL' as QueryLanguage,
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


  render() {
    const {
      datamartId,
      automationFormData,
      saveOrUpdate,
      loading,
    } = this.props;
    const { automationTreeData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        <Layout>
          <AutomationActionBar
            automationData={{
              automation:
                automationFormData && automationFormData.automation
                  ? {
                      ...automationFormData.automation,
                      datamart_id: datamartId,
                    }
                  : undefined,
              automationTreeData: automationTreeData,
            }}
            saveOrUpdate={saveOrUpdate}
          />
          <Layout.Content
            className={`mcs-content-container`}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <AutomationBuilder
              datamartId={datamartId}
              automationTreeData={automationTreeData}
              scenarioId={storylineNodeData[0].scenario_id}
              updateAutomationData={this.handleUpdateAutomationData}
              updateQueryNode={this.handleQueryNodeData}
              viewer={false}
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
  withRouter,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
