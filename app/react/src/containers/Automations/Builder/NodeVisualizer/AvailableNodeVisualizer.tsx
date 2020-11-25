import * as React from 'react';
import { Row, Tree } from 'antd';
import AvailableNode from './AvailableNode';
import {
  ScenarioNodeShape,
  IfNodeResource,
} from '../../../../models/automations/automations';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { AntIcon } from '../domain';
import {
  INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
  INITIAL_ADD_TO_SEGMENT_NODE_FORM_DATA,
  INITIAL_DELETE_FROM_SEGMENT_NODE_FORM_DATA,
} from '../AutomationNode/Edit/domain';
import { generateFakeId } from '../../../../utils/FakeIdHelper';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import { compose } from 'recompose';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

const { TreeNode } = Tree;

const messages = defineMessages({
  availableNodeTitle: {
    id: 'automation.builder.availableNode.title',
    defaultMessage: 'Automation Components',
  },
  availableNodeSubtitle: {
    id: 'automation.builder.availableNode.subtitle',
    defaultMessage:
      'Drag and drop your components in the builder to create your automation.',
  },
  actionsTitle: {
    id: 'automation.builder.availableNode.actions.title',
    defaultMessage:
      'Actions',
  },
  flowControlTitle: {
    id: 'automation.builder.availableNode.flowControl.title',
    defaultMessage:
      'Flow control',
  },
});

export interface AvailableNode {
  node: ScenarioNodeShape;
  iconType?: McsIconType;
  iconAnt?: AntIcon;
  color: string;
  branchNumber?: number;
}

interface State {
  actionNodes: ScenarioNodeShape[];
  conditionNodes: ScenarioNodeShape[];
  exitsNodes: ScenarioNodeShape[];
}

const emailCampaignNode: ScenarioNodeShape = {
  id: generateFakeId(),
  type: 'EMAIL_CAMPAIGN',
  scenario_id: '',
  campaign_id: '',
  formData: INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
  initialFormData: INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
};

const addToSegmentNode: ScenarioNodeShape = {
  id: generateFakeId(),
  type: 'ADD_TO_SEGMENT_NODE',
  user_list_segment_id: '',
  user_segment_expiration_period: '0',
  scenario_id: '',
  formData: INITIAL_ADD_TO_SEGMENT_NODE_FORM_DATA,
  initialFormData: INITIAL_ADD_TO_SEGMENT_NODE_FORM_DATA,
};

const deleteFromSegmentNode: ScenarioNodeShape = {
  id: generateFakeId(),
  type: 'DELETE_FROM_SEGMENT_NODE',
  user_list_segment_id: '',
  scenario_id: '',
  formData: INITIAL_DELETE_FROM_SEGMENT_NODE_FORM_DATA,
  initialFormData: INITIAL_DELETE_FROM_SEGMENT_NODE_FORM_DATA,
};

const customActionNode: ScenarioNodeShape = {
  id: generateFakeId(),
  type: 'CUSTOM_ACTION_NODE',
  scenario_id: '',
  formData: { name: '' },
};

const conditionNode1: ScenarioNodeShape = {
  id: generateFakeId(),
  type: 'ABN_NODE',
  scenario_id: '',
  edges_selection: {},
  branch_number: 2,
  formData: {
    edges_selection: {},
    branch_number: 2,
  },
};

const conditionNode2: ScenarioNodeShape = {
  id: generateFakeId(),
  type: 'WAIT_NODE',
  scenario_id: '',
  delay_period: 'PT1H',
  formData: {
    wait_duration: {
      unit: 'hours',
      value: '1',
    },
    day_window: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
  },
};

const conditionNode3: IfNodeResource = {
  id: generateFakeId(),
  type: 'IF_NODE',
  scenario_id: '',
  query_id: '',
  formData: {},
};

type Props = InjectedFeaturesProps & InjectedIntlProps;

class AvailableNodeVisualizer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      actionNodes: [],
      conditionNodes: [],
      exitsNodes: [],
    };
  }

  componentWillMount() {
    const actionNodesList = [emailCampaignNode]
      .concat(
        this.props.hasFeature('automations-add-delete-to-from-segment-node')
          ? [addToSegmentNode, deleteFromSegmentNode]
          : [],
      )
      .concat(
        this.props.hasFeature('automations-custom-action-node')
          ? [customActionNode]
          : [],
      );

    this.setState({
      actionNodes: actionNodesList,
      conditionNodes: [conditionNode1, conditionNode2, conditionNode3],
      exitsNodes: [],
    });
  }

  createNodeGrid = (nodeType: string, nodes: ScenarioNodeShape[]) => {
    const { intl } = this.props;
    return (
      <Tree defaultExpandAll={true} multiple={false} draggable={false}>
        <TreeNode title={nodeType} selectable={false}>
          {nodes.map(node => {
            return (
              <TreeNode
                title={<AvailableNode node={node} intl={intl} />}
                key={node.id}
              />
            );
          })}
        </TreeNode>
      </Tree>
    );
  };

  render() {
    const { intl } = this.props;
    return (
      <div className="mcs-availableNodeVisualizer">
        <Row className="mcs-availableNodeVisualizer_header">
          <div className="mcs-availableNodeVisualizer_title">
            {intl.formatMessage(messages.availableNodeTitle)}
          </div>
          <div className="mcs-availableNodeVisualizer_subtitle">
            {intl.formatMessage(messages.availableNodeSubtitle)}
          </div>
        </Row>
        <Row className="mcs-availableNodeVisualizer_row">
          {this.createNodeGrid(intl.formatMessage(messages.actionsTitle), this.state.actionNodes)}
        </Row>
        <Row className="mcs-availableNodeVisualizer_row">
          {this.createNodeGrid(intl.formatMessage(messages.flowControlTitle), this.state.conditionNodes)}
        </Row>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  injectFeatures,
)(AvailableNodeVisualizer);
