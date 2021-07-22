import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../../../Audience/AdvancedSegmentBuilder/Diagram/Port/SimplePortModel';
import { StorylineNodeModel } from '../domain';
import ABNAutomationForm from './Edit/ABNAutomationForm/ABNAutomationForm';
import DefaultAutomationForm from './Edit/DefaultForm/DefaultAutomationForm';
import { AutomationFormPropsType } from './Edit/domain';
import EmailCampaignAutomationForm from './Edit/EmailCampaignForm/EmailCampaignAutomationForm';
import IfNodeForm from './Edit/IfNodeForm/IfNodeForm';
import WaitForm from './Edit/WaitForm/WaitForm';
import AddToSegmentAutomationForm from './Edit/AddToSegmentNodeForm/AddToSegmentSegmentAutomationForm';
import DeleteFromSegmentAutomationForm from './Edit/DeleteFromSegmentNodeForm/DeleteFromSegmentAutomationForm';
import ReactToEventAutomationForm from './Edit/ReactToEventAutomationForm/ReactToEventAutomationForm';
import OnSegmentEntryInputAutomationForm from './Edit/OnSegmentEntryInputForm/OnSegmentEntryInputAutomationForm';
import OnSegmentExitInputAutomationForm from './Edit/OnSegmentExitInputForm/OnSegmentExitInputAutomationForm';
import CustomActionAutomationForm from './Edit/CustomActionNodeForm/CustomActionAutomationForm';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import AudienceSegmentFeedAutomationForm from './Edit/AudienceSegmentFeedNodeForm/AudienceSegmentFeedAutomationForm';
import { ScenarioCountersData } from '../../../../utils/ScenarioAnalyticsReportHelper';

export default class AutomationNodeModel extends NodeModel {
  collapsed = false;
  negation = false;
  datamartId: string;
  iconType: McsIconType;
  title: string;
  subtitle?: string;
  color: string;
  storylineNodeModel: StorylineNodeModel;
  getScenarioCountersData: () => ScenarioCountersData | undefined;
  editFormComponent: React.ComponentClass<AutomationFormPropsType>;
  root?: boolean;
  icon?: McsIconType;
  iconAssetUrl?: string;
  iconAnt?: React.ReactNode;
  isFirstNode?: boolean;

  constructor(
    datamartId?: string,
    storylineNodeModel?: StorylineNodeModel,
    getScenarioCountersData?: () => ScenarioCountersData | undefined,
    title?: string,
    subtitle?: string,
    color?: string,
    iconType?: McsIconType,
    iconAssetUrl?: string,
    iconAnt?: React.ReactNode,
    treeNodePath?: number[],
    isFirstNode?: boolean,
  ) {
    super('automation-node');

    this.addPort(new SimplePortModel('center'));
    this.addPort(new SimplePortModel('right'));

    this.icon = iconType;

    if (
      datamartId === undefined ||
      title === undefined ||
      color === undefined ||
      storylineNodeModel === undefined ||
      getScenarioCountersData === undefined
    ) {
      throw new Error('missing parameters');
    }
    this.datamartId = datamartId;
    this.title = title;
    this.subtitle = subtitle;
    this.color = color;
    this.storylineNodeModel = storylineNodeModel;
    this.getScenarioCountersData = getScenarioCountersData;
    this.iconAnt = iconAnt;
    this.iconAssetUrl = iconAssetUrl;
    this.isFirstNode = isFirstNode;

    switch (this.storylineNodeModel.node.type) {
      case 'EMAIL_CAMPAIGN':
        this.editFormComponent = EmailCampaignAutomationForm;
        break;
      case 'ADD_TO_SEGMENT_NODE':
        this.editFormComponent = AddToSegmentAutomationForm;
        break;
      case 'DELETE_FROM_SEGMENT_NODE':
        this.editFormComponent = DeleteFromSegmentAutomationForm;
        break;
      case 'ABN_NODE':
        this.editFormComponent = ABNAutomationForm;
        break;
      case 'QUERY_INPUT':
        this.editFormComponent = ReactToEventAutomationForm;
        break;
      case 'ON_SEGMENT_ENTRY_INPUT_NODE':
        this.editFormComponent = OnSegmentEntryInputAutomationForm;
        break;
      case 'ON_SEGMENT_EXIT_INPUT_NODE':
        this.editFormComponent = OnSegmentExitInputAutomationForm;
        break;
      case 'WAIT_NODE':
        this.editFormComponent = WaitForm;
        break;
      case 'IF_NODE':
        this.editFormComponent = IfNodeForm;
        break;
      case 'CUSTOM_ACTION_NODE':
        this.editFormComponent = CustomActionAutomationForm;
        break;
      case 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE':
        this.editFormComponent = AudienceSegmentFeedAutomationForm;
        break;
      default:
        this.editFormComponent = DefaultAutomationForm;
        break;
    }
  }

  getPosition = () => {
    return {
      x: this.x,
      y: this.y,
    };
  };

  getSize() {
    return {
      width: 50,
      height: 50,
      borderWidth: 2,
    };
  }

  getNodeCounterHeight() {
    return this.getSize().height * 0.5;
  }

  getNodeSize() {
    return {
      width: 180,
      height: 90,
    };
  }

  getColor() {
    return this.color;
  }
}
