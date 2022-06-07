import * as React from 'react';
import { Card, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CloseOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

export interface Step<StepsProperties> {
  id?: string;
  name: string;
  properties: StepsProperties;
}

interface TimelineStepBuilderRendering<StepsProperties> {
  shouldDisplayNumbersInBullet: boolean;
  renderHeaderTimeline?: () => JSX.Element;
  renderFooterTimeline?: () => JSX.Element;
  renderStepHeader?: (step: Step<StepsProperties>, index: number) => JSX.Element;
  renderStepBody: (step: Step<StepsProperties>, index: number) => JSX.Element;
  renderAfterBulletElement?: (step: Step<StepsProperties>, index: number) => JSX.Element;
  getAddStepText?: () => { id: string; defaultMessage?: string };
  shouldRenderDisabledArrow?: boolean;
  shouldRenderArrows?: boolean;
  shouldRenderTimeline?: boolean;
}

export interface StepManagement<StepsProperties> {
  computeStepName?: (step: Step<StepsProperties>, index: number) => string;
  onStepAdded: (steps: Array<Step<StepsProperties>>) => void;
  onStepRemoved: (steps: Array<Step<StepsProperties>>, stepId?: string) => void;
  onStepsReordered: (steps: Array<Step<StepsProperties>>) => void;
  getDefaultStep: () => Step<StepsProperties>;
}

type Props<StepsProperties> = {
  steps: Array<Step<StepsProperties>>;
  rendering: TimelineStepBuilderRendering<StepsProperties>;
  stepManagement: StepManagement<StepsProperties>;
  maxSteps: number;
  editionMode?: boolean;
  mainStep?: boolean;
};

export default class TimelineStepBuilder<StepsProperties> extends React.Component<
  Props<StepsProperties>
> {
  constructor(props: Props<StepsProperties>) {
    super(props);

    this.state = {};
  }

  addStep = () => {
    const { steps, stepManagement } = this.props;
    const newSteps = steps.slice();
    newSteps.push(this.getRenamedStep(stepManagement.getDefaultStep(), steps.length));
    stepManagement.onStepAdded(newSteps);
  };

  removeStep = (stepId: string) => {
    const { steps, stepManagement } = this.props;
    const newSteps = steps.filter(step => step.id !== stepId).map(this.getRenamedStep);
    stepManagement.onStepRemoved(newSteps, stepId);
  };

  getRenamedStep = (step: Step<StepsProperties>, index: number) => {
    step.name = this.props.stepManagement.computeStepName?.(step, index) ?? `Step ${index + 1}`;
    return step;
  };

  sortStep = (index: number, direction: 'up' | 'down') => {
    const { steps, stepManagement } = this.props;

    const temp = steps[index];

    if (direction === 'up' && index > 0) {
      steps[index] = steps[index - 1];
      steps[index - 1] = temp;
    }

    if (direction === 'down' && index + 1 < steps.length) {
      steps[index] = steps[index + 1];
      steps[index + 1] = temp;
    }
    stepManagement.onStepsReordered(steps.map(this.getRenamedStep));
  };

  private computeTimelineEndClassName(stepsNumber: number) {
    if (stepsNumber < this.props.maxSteps) return 'mcs-timelineStepBuilder_step_timelineEnd';
    else return 'mcs-timelineStepBuilder_step_timelineEndWithoutButton';
  }

  render() {
    const {
      steps,
      editionMode,
      rendering: {
        shouldRenderTimeline,
        renderHeaderTimeline,
        shouldRenderArrows,
        shouldRenderDisabledArrow,
        renderStepHeader,
        renderStepBody,
        renderAfterBulletElement,
        renderFooterTimeline,
        getAddStepText,
        shouldDisplayNumbersInBullet,
      },
      maxSteps,
      mainStep,
    } = this.props;

    const shouldRenderLine = shouldRenderTimeline === undefined || shouldRenderTimeline;
    return (
      <div className={'mcs-timelineStepBuilder ' + (steps.length === 0 ? 'empty' : '')}>
        <div
          className={
            shouldRenderLine
              ? 'mcs-timelineStepBuilder_steps'
              : 'mcs-timelineStepBuilder_steps_noline'
          }
        >
          <div className={'mcs-timelineStepBuilder_step_timelineStart'}>
            {renderHeaderTimeline?.()}
          </div>
          {steps.map((step, index) => {
            return (
              <Card
                key={step.id}
                className={`mcs-timelineStepBuilder_step ${
                  mainStep && index !== 0 ? 'mcs-timelineStepBuilder_mainStep' : ''
                }`}
                bordered={false}
              >
                <div className={'mcs-timelineStepBuilder_step_body'}>
                  {steps.length > 1 && shouldRenderArrows && (
                    <div className={'mcs-timelineStepBuilder_step_reorderBtn'}>
                      {(shouldRenderDisabledArrow || index > 0) && (
                        <ArrowUpOutlined
                          className={
                            'mcs-timelineStepBuilder_sortBtn mcs-timelineStepBuilder_sortBtn--up ' +
                            (index > 0 ? '' : 'disabled')
                          }
                          onClick={
                            index > 0
                              ? this.sortStep.bind(this, index, 'up')
                              : () => {
                                  return;
                                }
                          }
                        />
                      )}
                      {(shouldRenderDisabledArrow || index + 1 < steps.length) && (
                        <ArrowDownOutlined
                          className={
                            'mcs-timelineStepBuilder_sortBtn ' +
                            (index + 1 < steps.length ? '' : 'disabled')
                          }
                          onClick={
                            index + 1 < steps.length
                              ? this.sortStep.bind(this, index, 'down')
                              : () => {
                                  return;
                                }
                          }
                        />
                      )}
                    </div>
                  )}
                  <div className={'mcs-timelineStepBuilder_step_content'}>
                    <div className={'mcs-timelineStepBuilder_stepHeader'}>
                      {renderStepHeader?.(step, index) || (
                        <div className='mcs-timelineStepBuilder_stepName_title'>{step.name}</div>
                      )}
                      <Button
                        shape='circle'
                        icon={<CloseOutlined />}
                        className={'mcs-timelineStepBuilder_removeStepBtn'}
                        onClick={this.removeStep.bind(this, step.id)}
                      />
                    </div>
                    {renderStepBody(step, index)}
                  </div>
                </div>
                {shouldRenderLine ? (
                  <div>
                    <div className={'mcs-timelineStepBuilder_step_bullet'}>
                      <div className={'mcs-timelineStepBuilder_step_bullet_icon'}>
                        {shouldDisplayNumbersInBullet ? index + 1 : ''}
                      </div>
                    </div>
                    {renderAfterBulletElement?.(step, index)}
                  </div>
                ) : undefined}
              </Card>
            );
          })}
          <div className={'mcs-timelineStepBuilder_addStepBlock'}>
            <div className={this.computeTimelineEndClassName(steps.length)}>
              {renderFooterTimeline?.()}
            </div>
            {steps.length < maxSteps && !editionMode && (
              <Button className={'mcs-timelineStepBuilder_addStepBtn'} onClick={this.addStep}>
                <FormattedMessage
                  {...(getAddStepText?.() || {
                    id: 'timeline.stepBuilder.newStep',
                    defaultMessage: 'Add a step',
                  })}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
