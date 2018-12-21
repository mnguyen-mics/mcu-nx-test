import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../../../QueryTool/JSONOTQL/Diagram/Port/SimplePortModel';
import { McsIconType } from '../../../../components/McsIcon';
import { StorylineNodeModel, AntIcon } from '../domain';

export default class AutomationNodeModel extends NodeModel {
  collapsed = false;
  negation = false;
  datamartId: string;
  iconType: McsIconType;
  title: string;
  color: string;
  storylineNodeModel: StorylineNodeModel;
  root?: boolean;
  icon?: McsIconType;
  iconAnt?: AntIcon;  

  constructor(datamartId: string,
    storylineNodeModel: StorylineNodeModel,
    title: string,
    color: string,
    iconType?: McsIconType,
    iconAnt?: AntIcon,
    treeNodePath?: number[],
  ) {
    super('automation-node');

    this.addPort(new SimplePortModel('center'));
    this.addPort(new SimplePortModel('right'));

    this.icon = iconType;
    this.datamartId = datamartId;
    this.title = title;
    this.color = color;
    this.storylineNodeModel = storylineNodeModel;
    this.iconAnt = iconAnt;
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
