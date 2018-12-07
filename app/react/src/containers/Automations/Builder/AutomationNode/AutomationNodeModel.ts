import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../../../QueryTool/JSONOTQL/Diagram/Port/SimplePortModel';
import { McsIconType } from '../../../../components/McsIcon';
import { StorylineNodeModel } from '../domain';

export default class AutomationNodeModel extends NodeModel {
  collapsed = false;
  negation = false;
  iconType: McsIconType;
  title: string;
  color: string;
  storylineNodeModel: StorylineNodeModel;
  root?: boolean;

  constructor(
    storylineNodeModel: StorylineNodeModel,
    iconType: McsIconType,
    title: string,
    color: string,
    width: number,
    height: number,
    treeNodePath?: number[],
  ) {
    super('automation-node');

    this.addPort(new SimplePortModel('center'));
    this.addPort(new SimplePortModel('right'));

    this.iconType = iconType;
    this.title = title;
    this.color = color;
    this.width = width;
    this.height = height;
    this.storylineNodeModel = storylineNodeModel;
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

  getColor() {
    return this.color;
  }
}
