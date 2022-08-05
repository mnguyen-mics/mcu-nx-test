import { Card } from '@mediarithmics-private/mcs-components-library';
import { Button, Statistic, Steps } from 'antd';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import {
  ContextualTargetingResource,
  ContextualTargetingStatus,
} from '../../../../../models/contextualtargeting/ContextualTargeting';
import { ChartDataResource } from './ContextualTargetingChart';
import { messages } from './messages';

const { Step } = Steps;

interface ContextualTargetingStatsCardProps {
  contextualTargeting?: ContextualTargetingResource;
  isLiveEditing?: boolean;
  chartDataSelected?: ChartDataResource;
  numberOfTargetedContent?: number;
  onPublishContextualTargeting: () => void;
  onEdit: () => void;
  getTargetedVolumeRatio: () => number;
}

type Props = ContextualTargetingStatsCardProps & InjectedIntlProps;

class ContextualTargetingStatsCard extends React.Component<Props> {
  getStepIndex = (status?: ContextualTargetingStatus) => {
    const { isLiveEditing } = this.props;
    switch (status) {
      case undefined:
        return -1;
      case 'INIT':
        return 0;
      case 'DRAFT':
        return 1;
      case 'PUBLISHED':
        return 2;
      case 'LIVE':
        if (isLiveEditing) return 1;
        else return 2;
      case 'LIVE_PUBLISHED':
        return 2;
    }
  };

  renderTargetedVolumeRatio = () => {
    const { chartDataSelected, getTargetedVolumeRatio } = this.props;
    return (
      <div>
        <span className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_volumeRatioValue'>
          {Math.round(getTargetedVolumeRatio() * 100) + '%'}
        </span>
        <span className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_liftValue'>
          {`(Lift = ${chartDataSelected?.lift.toFixed(1)})`}
        </span>
      </div>
    );
  };

  renderTargetedVolume = () => {
    const { chartDataSelected } = this.props;
    return chartDataSelected ? <div>{chartDataSelected?.reach * 1000000}</div> : <div />;
  };

  render() {
    const {
      contextualTargeting,
      onPublishContextualTargeting,
      onEdit,
      numberOfTargetedContent,
      isLiveEditing,
    } = this.props;
    const { intl } = this.props;

    const liveDurationInDays =
      contextualTargeting &&
      contextualTargeting.live_activation_ts &&
      Math.floor((Date.now() - contextualTargeting.live_activation_ts) / (1000 * 60 * 60 * 24));

    const liveCard =
      contextualTargeting?.status === 'LIVE' &&
      contextualTargeting?.live_activation_ts &&
      !isLiveEditing ? (
        <Card className='mcs-contextualTargetingDashboard_liveCard'>
          <div className='mcs-contextualTargetingDashboard_liveCard_title'>LIVE</div>
          <div className='mcs-contextualTargetingDashboard_liveCard_duration'>
            {liveDurationInDays + ' days ago'}
          </div>
        </Card>
      ) : (
        <div />
      );

    const stepIndex = this.getStepIndex(contextualTargeting?.status);

    const steps = (contextualTargeting?.status !== 'LIVE' ||
      (contextualTargeting?.status === 'LIVE' && isLiveEditing)) && (
      <Steps direction='vertical' current={stepIndex}>
        <Step
          title={intl.formatMessage(messages.stepOneTitle)}
          description={intl.formatMessage(messages.stepOneDescription)}
        />
        <Step
          title={intl.formatMessage(messages.stepTwoTitle)}
          description={intl.formatMessage(messages.stepTwoDescription)}
        />
        <Step
          title={intl.formatMessage(messages.stepThreeTitle)}
          description={intl.formatMessage(messages.stepThreeDescription)}
        />
      </Steps>
    );
    const isButtonDisable =
      contextualTargeting &&
      (contextualTargeting.status === 'PUBLISHED' ||
        contextualTargeting.status === 'LIVE_PUBLISHED');

    const stats = stepIndex >= 1 && (
      <div className='mcs-contextualTargetingDashboard_settingsCardContainer'>
        {contextualTargeting &&
          ((contextualTargeting.status === 'LIVE' && isLiveEditing) ||
            contextualTargeting.status === 'LIVE_PUBLISHED') && (
            <Card className='mcs-contextualTargetingDashboard_liveEditionCard'>
              <div className='mcs-contextualTargetingDashboard_liveEditionCard_title'>LIVE</div>
            </Card>
          )}
        <div className='mcs-contextualTargetingDashboard_settingsCardContainer_stats'>
          <Statistic
            className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_block'
            title={intl.formatMessage(messages.targetedRatio)}
            valueRender={this.renderTargetedVolumeRatio}
          />
          <Statistic
            className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_block'
            title={intl.formatMessage(messages.numberOfTargetedContent)}
            value={numberOfTargetedContent ? numberOfTargetedContent : 0}
          />
          <Statistic
            className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_block-last'
            title={intl.formatMessage(messages.targetedVolume)}
            valueRender={this.renderTargetedVolume}
          />
        </div>

        <Button
          className='mcs-contextualTargetingDashboard_settingsCardButton'
          onClick={
            contextualTargeting?.status === 'DRAFT' ||
            (contextualTargeting?.status === 'LIVE' && isLiveEditing)
              ? onPublishContextualTargeting
              : onEdit
          }
          disabled={isButtonDisable}
        >
          {isButtonDisable
            ? intl.formatMessage(messages.settingsCardButtonInProgress)
            : contextualTargeting?.status === 'DRAFT' ||
              (contextualTargeting?.status === 'LIVE' && isLiveEditing)
            ? intl.formatMessage(messages.settingsCardButtonActivation)
            : intl.formatMessage(messages.settingsCardButtonEdition)}
        </Button>
      </div>
    );

    return (
      <div className='mcs-contextualTargetingDashboard_settingsCol'>
        {liveCard}
        {steps}
        {stats}
      </div>
    );
  }
}

export default compose<Props, ContextualTargetingStatsCardProps>(injectIntl)(
  ContextualTargetingStatsCard,
);
