import * as React from 'react';
import Layout, { Content } from 'antd/lib/layout/layout';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../Datamart/WithDatamartSelector';
import { FormTitle } from '../../../components/Form';
import { Actionbar, MenuList, Loading } from '@mediarithmics-private/mcs-components-library';
import { ActionbarProps } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar';
import { Row, Col, Dropdown } from 'antd';
import { IAudienceBuilderService } from '../../../services/AudienceBuilderService';
import { AudienceBuilderResource } from '../../../models/audienceBuilder';

const messages = defineMessages({
  builder: {
    id: 'audience.builderSelector.builder',
    defaultMessage: 'Builders',
  },
  segmentBuilders: {
    id: 'audience.builderSelector.segmentBuilders',
    defaultMessage: 'Segment Builders',
  },
  standardTitle: {
    id: 'audience.builderSelector.standardTitle',
    defaultMessage: 'Standard',
  },
  standardSubtitle: {
    id: 'audience.builderSelector.standardSubtitle',
    defaultMessage: 'Pick some audience features and visualize the segment you are creating',
  },
  advancedTitle: {
    id: 'audience.builderSelector.advancedTitle',
    defaultMessage: 'Advanced',
  },
  advancedSubtitle: {
    id: 'audience.builderSelector.advancedSubtitle',
    defaultMessage: 'Use the visual OTQL tool to create an advanced query based on your schema',
  },
  expertTitle: {
    id: 'audience.builderSelector.expertTitle',
    defaultMessage: 'Expert: OTQL',
  },
  expertSubtitle: {
    id: 'audience.builderSelector.expertSubtitle',
    defaultMessage: 'Write your own OTQL queries and explore the results',
  },
  noStandardBuilders: {
    id: 'audience.builderSelector.noStandardBuilder',
    defaultMessage:
      'You need to set up audience features to use this builder. Contact your CSM to get started!',
  },
});

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  WithDatamartSelectorProps &
  InjectedIntlProps;

interface State {
  isLoadingBuilders: boolean;
  audienceBuilders?: AudienceBuilderResource[];
}

class SegmentBuilderSelector extends React.Component<Props, State> {
  // @lazyInject(TYPES.IAudienceSegmentService)
  // private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingBuilders: true,
    };
  }

  componentDidMount() {
    this.getAudienceBuilders();
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedDatamartId: prevSelectedDatamartId } = prevProps;
    const { selectedDatamartId } = this.props;
    if (prevSelectedDatamartId !== selectedDatamartId) {
      this.getAudienceBuilders();
    }
  }

  getAudienceBuilders() {
    const { selectedDatamartId, notifyError } = this.props;
    this._audienceBuilderService
      .getAudienceBuilders(selectedDatamartId)
      .then(res => {
        this.setState({
          audienceBuilders: res.data,
          isLoadingBuilders: false,
        });
      })
      .catch(err => {
        this.setState({
          isLoadingBuilders: false,
        });
        notifyError(err);
      });
  }

  getMenu = () => {
    const {
      match: {
        params: { organisationId },
      },
      selectedDatamartId,
    } = this.props;
    const { audienceBuilders, isLoadingBuilders } = this.state;

    return isLoadingBuilders ? (
      <Loading isFullScreen={true} />
    ) : audienceBuilders?.length === 1 ? (
      <div />
    ) : (
      <React.Fragment>
        {audienceBuilders?.map(b => {
          const handleSelect = (builderId: string) => {
            return this.makeStandardBuilderRedirection(
              organisationId,
              selectedDatamartId,
              builderId,
            );
          };
          return <MenuList key={b.id} title={b.name} select={handleSelect(b.id)} />;
        })}
      </React.Fragment>
    );
  };

  makeStandardBuilderRedirection = (
    organisationId: string,
    datamartId: string,
    builderId: string,
  ) => () => {
    return this.props.history.push(
      `/v2/o/${organisationId}/audience/segment-builder/standard?datamartId=${datamartId}&audienceBuilderId=${builderId}`,
    );
  };

  render() {
    const {
      history,
      match: {
        params: { organisationId },
      },
      selectedDatamartId,
      intl: { formatMessage },
    } = this.props;

    const { audienceBuilders } = this.state;

    const onTypeSelect = (type: 'standard' | 'advanced' | 'expert') => () => {
      if (type === 'expert') {
        history.push(
          `/v2/o/${organisationId}/datastudio/query-tool?datamartId=${selectedDatamartId}`,
        );
      } else if (type === 'advanced') {
        history.push(
          `/v2/o/${organisationId}/audience/segment-builder/advanced?datamartId=${selectedDatamartId}`,
        );
      }
    };

    const actionBarProps: ActionbarProps = {
      pathItems: [formatMessage(messages.builder)],
    };

    const getPopupContainer = () =>
      document.getElementById('mcs-standardSegmentBuilder_dropdownContainer')!;

    return (
      <Layout>
        <Actionbar {...actionBarProps} />
        <Content className='mcs-content-container mcs-form-container text-center'>
          <FormTitle title={messages.segmentBuilders} />

          <Row className='mcs-segmentBuilderSelector_container' gutter={60}>
            <Col
              className='mcs-standardSegmentBuilder'
              span={6}
              offset={3}
              onClick={
                audienceBuilders?.length === 1
                  ? this.makeStandardBuilderRedirection(
                      organisationId,
                      selectedDatamartId,
                      audienceBuilders[0].id,
                    )
                  : undefined
              }
            >
              {audienceBuilders?.length === 0 ? (
                <div className='mcs-segmentBuilderSelector_item'>
                  <span>{formatMessage(messages.noStandardBuilders)}</span>
                </div>
              ) : (
                <div
                  id='mcs-standardSegmentBuilder_dropdownContainer'
                  className='mcs-standardSegmentBuilder_dropdownContainer'
                >
                  <Dropdown
                    overlay={this.getMenu()}
                    placement='bottomCenter'
                    trigger={['hover']}
                    getPopupContainer={getPopupContainer}
                    overlayClassName='mcs-standardSegmentBuilder_dropdown'
                    align={{ overflow: { adjustY: false } }}
                  >
                    <div
                      className='mcs-segmentBuilderSelector_item'
                      onClick={onTypeSelect('standard')}
                      data-flip='false'
                    >
                      <img src='https://assets.mediarithmics.io/504/public/assets/1617024875777-cyNFPfPn/standardsegmentbuilder-icon.png' />
                      <div className='mcs-segmentBuilderSelector_itemTitle'>
                        {formatMessage(messages.standardTitle)}
                      </div>
                      <div className='mcs-segmentBuilderSelector_itemSubtitle'>
                        {formatMessage(messages.standardSubtitle)}
                      </div>
                    </div>
                  </Dropdown>
                </div>
              )}
            </Col>

            <Col className='mcs-advancedSegmentBuilder' span={6}>
              <div className='mcs-segmentBuilderSelector_item' onClick={onTypeSelect('advanced')}>
                <img src='https://assets.mediarithmics.io/504/public/assets/1617024854221-SdHpCYce/advancedsegmentbuilder-icon.png' />
                <div className='mcs-segmentBuilderSelector_itemTitle'>
                  {formatMessage(messages.advancedTitle)}
                </div>
                <div className='mcs-segmentBuilderSelector_itemSubtitle'>
                  {formatMessage(messages.advancedSubtitle)}
                </div>
              </div>
            </Col>
            <Col className='mcs-expertSegmentBuilder' span={6}>
              <div className='mcs-segmentBuilderSelector_item' onClick={onTypeSelect('expert')}>
                <img src='https://assets.mediarithmics.io/504/public/assets/1617024867713-wyQSumrW/otqlquery-icon.png' />
                <div className='mcs-segmentBuilderSelector_itemTitle'>
                  {formatMessage(messages.expertTitle)}
                </div>
                <div className='mcs-segmentBuilderSelector_itemSubtitle'>
                  {formatMessage(messages.expertSubtitle)}
                </div>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  withDatamartSelector,
)(SegmentBuilderSelector);
