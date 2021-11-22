import * as React from 'react';
import { Card, Button } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

export interface Step<StepsProperties> {
  id?: string;
  name: string;
  properties: StepsProperties;
}

interface TimelineStepBuilderRendering<StepsProperties> {
  renderHeaderTimeline?: () => JSX.Element;
  renderFooterTimeline?: () => JSX.Element;
  renderStepBody: (step: Step<StepsProperties>, index: number) => JSX.Element;
  renderAfterBulletElement?: (step: Step<StepsProperties>, index: number) => JSX.Element;
}

interface StepManagement<StepsProperties> {
  computeStepName?: (step: Step<StepsProperties>, index: number) => string;
  onStepAdded: (steps: Array<Step<StepsProperties>>) => void;
  onStepRemoved: (steps: Array<Step<StepsProperties>>) => void;
  onStepsReordered: (steps: Array<Step<StepsProperties>>) => void;
  getDefaultStep: () => Step<StepsProperties>;
}

type Props<StepsProperties> = {
  steps: Array<Step<StepsProperties>>;
  rendering: TimelineStepBuilderRendering<StepsProperties>;
  stepManagement: StepManagement<StepsProperties>;
  maxSteps: number;
};

export default class TimelineStepBuilder<StepsProperties> extends React.Component<Props<StepsProperties>> {
  constructor(props: Props<StepsProperties>) {
    super(props);

    this.state = {};
  }

  addStep = () => {
    const { steps } = this.props;
    const newSteps = steps.slice();
    newSteps.push(this.getRenamedStep(this.props.stepManagement.getDefaultStep(), steps.length));
    this.props.stepManagement.onStepAdded(newSteps);
  };

  removeStep = (stepId: string) => {
    const { steps } = this.props;
    const newSteps = steps.filter(step => step.id !== stepId).map(this.getRenamedStep);
    this.props.stepManagement.onStepRemoved(newSteps);
  };

  getRenamedStep = (step: Step<StepsProperties>, index: number) => {
    step.name = this.props.stepManagement.computeStepName?.(step, index) ?? `Step ${index + 1}`;
    return step;
  };

  sortStep = (index: number, direction: 'up' | 'down') => {
    const { steps } = this.props;

    const temp = steps[index];

    if (direction === 'up' && index > 0) {
      steps[index] = steps[index - 1];
      steps[index - 1] = temp;
    }

    if (direction === 'down' && index + 1 < steps.length) {
      steps[index] = steps[index + 1];
      steps[index + 1] = temp;
    }
    this.props.stepManagement.onStepsReordered(steps.map(this.getRenamedStep));
  };

  private computeTimelineEndClassName(stepsNumber: number) {
    if (stepsNumber < this.props.maxSteps)
      return 'mcs-funnelQueryBuilder_step_timelineEnd';
    else
      return 'mcs-funnelQueryBuilder_step_timelineEndWithoutButton';
  }

  render() {
    const { steps } = this.props;

    return (
      <div className={'mcs-funnelQueryBuilder'}>
        <div className={'mcs-funnelQueryBuilder_steps'}>
          <div className={'mcs-funnelQueryBuilder_step_timelineStart'}>
            {this.props.rendering.renderHeaderTimeline?.()}
          </div>
          {steps.map((step, index) => {
            return (
              <Card key={step.id} className={'mcs-funnelQueryBuilder_step'} bordered={false}>
                <div className={'mcs-funnelQueryBuilder_step_body'}>
                  {steps.length > 1 && (
                    <div className={'mcs-funnelQueryBuilder_step_reorderBtn'}>
                      {index > 0 && (
                        <ArrowUpOutlined
                          className={
                            'mcs-funnelQueryBuilder_sortBtn mcs-funnelQueryBuilder_sortBtn--up'
                          }
                          onClick={this.sortStep.bind(this, index, 'up')}
                        />
                      )}
                      {index + 1 < steps.length && (
                        <ArrowDownOutlined
                          className={'mcs-funnelQueryBuilder_sortBtn'}
                          onClick={this.sortStep.bind(this, index, 'down')}
                        />
                      )}
                    </div>
                  )}
                  <div className={'mcs-funnelQueryBuilder_step_content'}>
                    <div className={'mcs-funnelQueryBuilder_stepHeader'}>
                      <div className='mcs-funnelQueryBuilder_stepName_title'>{step.name}</div>
                      <Button
                        shape='circle'
                        icon={<CloseOutlined />}
                        className={'mcs-funnelQueryBuilder_removeStepBtn'}
                        onClick={this.removeStep.bind(this, step.id)}
                      />
                    </div>
                    {this.props.rendering.renderStepBody(step, index)}
                  </div>
                </div>
                <div className={'mcs-funnelQueryBuilder_step_bullet'}>
                  <div className={'mcs-funnelQueryBuilder_step_bullet_icon'}>{index + 1}</div>
                </div>
                {this.props.rendering.renderAfterBulletElement?.(step, index)}
              </Card>
            );
          })}
          <div className={'mcs-funnelQueryBuilder_addStepBlock'}>
            <div className={this.computeTimelineEndClassName(steps.length)}>
              {this.props.rendering.renderFooterTimeline?.()}
            </div>
            {steps.length < this.props.maxSteps && (
              <Button className={'mcs-funnelQueryBuilder_addStepBtn'} onClick={this.addStep}>
                <FormattedMessage
                  id='audience.funnel.querybuilder.newStep'
                  defaultMessage='Add a step'
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
