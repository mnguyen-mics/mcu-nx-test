import * as React from 'react';
import { Row, Collapse } from 'antd';
import AvailableNode from './AvailableNode';
import {
  ScenarioNodeShape,
  IfNodeResource,
} from '../../../../models/automations/automations';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import {
  INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
  INITIAL_ADD_TO_SEGMENT_NODE_FORM_DATA,
  INITIAL_DELETE_FROM_SEGMENT_NODE_FORM_DATA,
  FeedNodeFormData,
} from '../AutomationNode/Edit/domain';
import { generateFakeId } from '../../../../utils/FakeIdHelper';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import { compose } from 'recompose';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { IPluginService } from '../../../../services/PluginService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  PluginPresetProperty,
  PluginPresetResource,
  PluginType,
  PluginVersionResource,
  StrictlyLayoutablePlugin,
} from '../../../../models/Plugins';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../../models/plugin';

const { Panel } = Collapse;

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
    defaultMessage: 'Actions',
  },
  flowControlTitle: {
    id: 'automation.builder.availableNode.flowControl.title',
    defaultMessage: 'Flow control',
  },
});

export interface AvailableNode {
  node: ScenarioNodeShape;
  iconType?: McsIconType;
  iconAnt?: React.ReactNode;
  color: string;
  branchNumber?: number;
}

interface PluginLayoutAndVersionProperties {
  pluginLayout: PluginLayout;
  pluginVersion: PluginVersionResource;
  pluginVersionProperties: PropertyResourceShape[];
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

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedFeaturesProps &
  InjectedIntlProps;

class AvailableNodeVisualizer extends React.Component<Props, State> {
  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);

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

    this.state = {
      actionNodes: actionNodesList,
      conditionNodes: [conditionNode1, conditionNode2, conditionNode3],
      exitsNodes: [],
    };
  }

  componentDidMount() {
    const { actionNodes } = this.state;

    this.getFeedPresetNodes().then((feedPresetNodes) => {
      const actionNodesList = actionNodes.concat(feedPresetNodes);

      this.setState({
        actionNodes: actionNodesList,
      });
    });
  }

  getFeedPresetNodes = (): Promise<ScenarioNodeShape[]> => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    if (this.props.hasFeature('automations-feed-nodes')) {
      const pluginPresetFeedsP: Promise<PluginPresetResource[]> = [
        'AUDIENCE_SEGMENT_EXTERNAL_FEED',
        'AUDIENCE_SEGMENT_TAG_FEED',
      ].reduce(
        (
          accPromisePresets: Promise<PluginPresetResource[]>,
          currentFeedType: PluginType,
        ) => {
          const currentFeedTypePresets = this._pluginService
            .getPluginPresets({
              organisation_id: +organisationId,
              plugin_type: currentFeedType,
            })
            .then((resPresets) => resPresets.data)
            .catch((_) => [] as PluginPresetResource[]);

          return Promise.all([accPromisePresets, currentFeedTypePresets]).then(
            (resAccAndCurrentType) => {
              return resAccAndCurrentType[0].concat(resAccAndCurrentType[1]);
            },
          );
        },
        Promise.resolve([]),
      );

      const pluginLayoutsAndVersionPropertiesP: Promise<
        PluginLayoutAndVersionProperties[]
      > = pluginPresetFeedsP.then((pluginPresets) => {
        const distinctPluginVersionIds = [
          ...new Set(pluginPresets.map((preset) => preset.plugin_version_id)),
        ];

        return Promise.all(
          distinctPluginVersionIds.map((pluginVersionId) => {
            const associatedPluginId = pluginPresets.find(
              (preset) => preset.plugin_version_id === pluginVersionId,
            )?.plugin_id;

            const pluginLayoutP = associatedPluginId
              ? this._pluginService
                  .getLocalizedPluginLayout(associatedPluginId, pluginVersionId)
                  .then((pluginLayout) => {
                    return pluginLayout !== null ? pluginLayout : undefined;
                  })
              : Promise.resolve(undefined);

            const pluginVersionP = associatedPluginId
              ? this._pluginService
                  .getPluginVersion(associatedPluginId, pluginVersionId)
                  .then((resPluginVersion) => resPluginVersion.data)
                  .catch((err) => undefined)
              : Promise.resolve(undefined);

            const pluginVersionPropertiesP = associatedPluginId
              ? this._pluginService
                  .getPluginVersionProperties(
                    associatedPluginId,
                    pluginVersionId,
                  )
                  .then(
                    (resPluginVersionProperties) =>
                      resPluginVersionProperties.data,
                  )
                  .catch((err) => undefined)
              : Promise.resolve(undefined);

            return Promise.all([
              pluginLayoutP,
              pluginVersionP,
              pluginVersionPropertiesP,
            ]).then((resPluginLayoutAndVersion) => {
              const pluginLayout = resPluginLayoutAndVersion[0];
              const pluginVersion = resPluginLayoutAndVersion[1];
              const pluginVersionProperties = resPluginLayoutAndVersion[2];

              return { pluginLayout, pluginVersion, pluginVersionProperties };
            });
          }),
        ).then((resPluginLayoutsAndVersions) =>
          resPluginLayoutsAndVersions.reduce(
            (acc: PluginLayoutAndVersionProperties[], el) => {
              if (
                el.pluginLayout &&
                el.pluginVersion &&
                el.pluginVersionProperties
              ) {
                return acc.concat([
                  {
                    pluginLayout: el.pluginLayout,
                    pluginVersion: el.pluginVersion,
                    pluginVersionProperties: el.pluginVersionProperties,
                  },
                ]);
              }
              return acc;
            },
            [],
          ),
        );
      });

      return Promise.all([
        pluginLayoutsAndVersionPropertiesP,
        pluginPresetFeedsP,
      ])
        .then((resLayoutsAndPresets) => {
          const layoutsAndVersionProperties: PluginLayoutAndVersionProperties[] =
            resLayoutsAndPresets[0];
          const presets: PluginPresetResource[] = resLayoutsAndPresets[1];

          return presets.map((pluginPreset) => {
            const associatedLayoutAndVersionProperties = layoutsAndVersionProperties.find(
              (layoutAndVersionProperties) => {
                return (
                  layoutAndVersionProperties.pluginVersion?.id ===
                  pluginPreset.plugin_version_id
                );
              },
            );

            if (
              associatedLayoutAndVersionProperties &&
              pluginPreset.plugin_type
            ) {
              const strictlyLayoutablePlugin: StrictlyLayoutablePlugin = {
                plugin_layout:
                  associatedLayoutAndVersionProperties.pluginLayout,
                plugin_preset: pluginPreset,
                plugin_version_properties:
                  associatedLayoutAndVersionProperties.pluginVersionProperties,
                id:
                  associatedLayoutAndVersionProperties.pluginVersion.plugin_id,
                name: pluginPreset.name,
                organisation_id: pluginPreset.organisation_id,
                plugin_type: pluginPreset.plugin_type,
                group_id:
                  associatedLayoutAndVersionProperties.pluginVersion.group_id,
                artifact_id:
                  associatedLayoutAndVersionProperties.pluginVersion
                    .artifact_id,
                current_version_id:
                  associatedLayoutAndVersionProperties.pluginVersion.id,
              };

              const reduceFunctionForPropertyResourceShape = (
                o: { [key: string]: PropertyResourceShape },
                prop: PropertyResourceShape,
              ): { [key: string]: PropertyResourceShape } => {
                return {
                  ...o,
                  [prop.technical_name]: prop,
                };
              };

              const reduceFunctionForPluginPresetProperty = (
                o: { [key: string]: PropertyResourceShape },
                prop: PluginPresetProperty,
              ): { [key: string]: PropertyResourceShape } => {
                const foundProperty = o[prop.technical_name];

                if (foundProperty) {
                  const modifiedProp: PropertyResourceShape = {
                    ...foundProperty,
                    value: prop.value,
                  };
                  return {
                    ...o,
                    [prop.technical_name]: modifiedProp,
                  };
                } else return o;
              };

              const pluginVersionProperties = associatedLayoutAndVersionProperties.pluginVersionProperties.reduce(
                reduceFunctionForPropertyResourceShape,
                {},
              );

              const propertiesWithPreset = pluginPreset.properties.reduce(
                reduceFunctionForPluginPresetProperty,
                pluginVersionProperties,
              );

              const allProperties: { [key: string]: PropertyResourceShape } = {
                ...propertiesWithPreset,
              };

              const feedNodeFormData: FeedNodeFormData = {
                properties: allProperties,
              };

              const scenarioNodeShape: ScenarioNodeShape = {
                id: generateFakeId(),
                type: 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE',
                scenario_id: '',
                formData: feedNodeFormData,
                strictlyLayoutablePlugin,
              };

              return scenarioNodeShape;
            }
            return undefined;
          });
        })
        .then((resLayoutablesOrUndefined) =>
          resLayoutablesOrUndefined.reduce(
            (acc: ScenarioNodeShape[], el: ScenarioNodeShape | undefined) => {
              if (el) return acc.concat([el]);
              return acc;
            },
            [],
          ),
        );
    } else return Promise.resolve([]);
  };

  createNodeGrid = (nodes: ScenarioNodeShape[]) => {
    const { intl } = this.props;
    return nodes.map((n) => <AvailableNode node={n} intl={intl} key={n.id} />);
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
        <Collapse defaultActiveKey={['1']} bordered={false}>
          <Panel
            header={intl.formatMessage(messages.actionsTitle)}
            key="1"
            className="mcs-availableNodeVisualizer_panel"
          >
            {this.createNodeGrid(this.state.actionNodes)}
          </Panel>
          <Panel
            header={intl.formatMessage(messages.flowControlTitle)}
            key="2"
            className="mcs-availableNodeVisualizer_panel"
          >
            {this.createNodeGrid(this.state.conditionNodes)}
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectFeatures,
)(AvailableNodeVisualizer);
