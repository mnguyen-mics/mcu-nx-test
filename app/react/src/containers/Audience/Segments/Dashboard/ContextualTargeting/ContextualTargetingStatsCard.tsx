import { SettingOutlined } from '@ant-design/icons';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { Button, Dropdown, Menu, Statistic, Steps } from 'antd';
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
  onArchiveContextualTargeting: () => void;
  onEdit: () => void;
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

  renderTargetedVolume = () => {
    const { chartDataSelected } = this.props;
    return chartDataSelected ? Math.round(chartDataSelected?.reach) : 0;
  };

  renderLiveDuration = () => {
    const { contextualTargeting } = this.props;
    const liveDurationInDays =
      contextualTargeting?.live_activation_ts &&
      Math.floor((Date.now() - contextualTargeting.live_activation_ts) / (1000 * 60 * 60 * 24));

    const liveDurationInHours =
      contextualTargeting?.live_activation_ts &&
      Math.floor((Date.now() - contextualTargeting.live_activation_ts) / (1000 * 60 * 60));

    return liveDurationInDays !== 0
      ? liveDurationInDays + (liveDurationInDays === 1 ? ' day ago' : ' days ago')
      : liveDurationInHours !== 0
      ? liveDurationInHours + (liveDurationInHours === 1 ? ' hour ago' : ' hours ago')
      : 'Just now';
  };

  render() {
    const {
      contextualTargeting,
      chartDataSelected,
      onPublishContextualTargeting,
      onArchiveContextualTargeting,
      onEdit,
      numberOfTargetedContent,
      isLiveEditing,
    } = this.props;
    const { intl } = this.props;

    const liveCard =
      contextualTargeting?.status === 'LIVE' &&
      contextualTargeting?.live_activation_ts &&
      !isLiveEditing ? (
        <Card className='mcs-contextualTargetingDashboard_liveCard'>
          <div className='mcs-contextualTargetingDashboard_liveCard_title'>LIVE</div>
          <div className='mcs-contextualTargetingDashboard_liveCard_duration'>
            {this.renderLiveDuration()}
          </div>
        </Card>
      ) : (
        <div />
      );

    const stepIndex = this.getStepIndex(contextualTargeting?.status);

    const steps = (contextualTargeting?.status !== 'LIVE' ||
      (contextualTargeting?.status === 'LIVE' && isLiveEditing)) && (
      <Steps direction='vertical' current={stepIndex}>
        <Step title={intl.formatMessage(messages.stepOneTitle)} />
        <Step title={intl.formatMessage(messages.stepTwoTitle)} />
        <Step title={intl.formatMessage(messages.stepThreeTitle)} />
      </Steps>
    );
    const isButtonDisable =
      contextualTargeting &&
      (contextualTargeting.status === 'PUBLISHED' ||
        contextualTargeting.status === 'LIVE_PUBLISHED');

    const settingsMenu = (
      <Menu className='mcs-menu-antd-customized'>
        <Menu.Item
          className='mcs-channelsListPage_new_site_button'
          onClick={onArchiveContextualTargeting}
        >
          {intl.formatMessage(messages.archived)}
        </Menu.Item>
      </Menu>
    );

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
          <div className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_settings'>
            {intl.formatMessage(messages.settings)}
            <Dropdown overlay={settingsMenu} trigger={['click']} placement='bottomRight'>
              <SettingOutlined className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_settings_dropdown' />
            </Dropdown>
          </div>
          <hr className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_separator' />
          <Statistic
            className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_block'
            title={intl.formatMessage(messages.lift)}
            value={chartDataSelected ? chartDataSelected.lift.toFixed(2) : 0}
          />
          <Statistic
            className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_block'
            title={intl.formatMessage(messages.numberOfTargetedContent)}
            value={numberOfTargetedContent ? numberOfTargetedContent : 0}
          />
          <Statistic
            className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_block'
            title={intl.formatMessage(messages.targetedVolume)}
            value={this.renderTargetedVolume()}
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
