import * as React from 'react';
import { Layout, Row } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import { defineMessages, FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { MenuList, MenuPresentational } from '@mediarithmics-private/mcs-components-library';
import { FeedAction } from './domain';
import { compose } from 'recompose';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart';

const { Content } = Layout;

export interface AudienceFeedSelectorProps {
  onSelect: (feedType: FeedAction) => void;
}

type Props = AudienceFeedSelectorProps &
  WrappedComponentProps &
  InjectedFeaturesProps &
  InjectedWorkspaceProps;

const messages = defineMessages({
  listTitle: {
    id: 'audience.segments.form.audienceFeedSelector.title',
    defaultMessage: 'Feed Types',
  },
  listSubtitle: {
    id: 'audience.segments.form.audienceFeedSelector.subtitle',
    defaultMessage: 'Chose your feed type.',
  },
  segmentTypeOr: {
    id: 'audience.segments.form.audienceFeedSelector.or',
    defaultMessage: 'Or',
  },
  feedAdvanced: {
    id: 'audience.segments.form.audienceFeedSelector.advanced',
    defaultMessage: 'Advanced',
  },
  createServerSidePreset: {
    id: 'audience.segments.form.audienceFeedSelector.createServerSidePreset',
    defaultMessage: 'Create a server side preset',
  },
  createClientSidePreset: {
    id: 'audience.segments.form.audienceFeedSelector.createClientSidePreset',
    defaultMessage: 'Create a client side preset',
  },
});

class AudienceFeedSelector extends React.Component<Props> {
  onSelect = (feedType: FeedAction) => () => {
    this.props.onSelect(feedType);
  };

  hasRightToCreatePreset(): boolean {
    const {
      workspace: { role },
    } = this.props;

    if (role === 'ORGANISATION_ADMIN' || role === 'COMMUNITY_ADMIN' || role === 'CUSTOMER_ADMIN')
      return true;

    return false;
  }

  render() {
    const {
      intl: { formatMessage },
      hasFeature,
    } = this.props;

    return (
      <Layout>
        <div className='edit-layout ant-layout'>
          <Layout>
            <Content className='mcs-content-container mcs-form-container text-center'>
              <FormTitle title={messages.listTitle} subtitle={messages.listSubtitle} />
              <Row className='mcs-selector_container'>
                <Row className='menu'>
                  <div className='presentation'>
                    <MenuPresentational
                      title={'Server side'}
                      subtitles={['Triggered when users are added / deleted from segment']}
                      type='data'
                      select={this.onSelect('create_external')}
                    />
                    <div className='separator'>
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={'Client side'}
                      subtitles={['Triggered when users are visiting your webpages / apps']}
                      type='code'
                      select={this.onSelect('create_tag')}
                    />
                  </div>
                </Row>
                {hasFeature('plugins-presets') && this.hasRightToCreatePreset() ? (
                  <div>
                    <Row className='intermediate-title'>
                      <FormattedMessage {...messages.feedAdvanced} />
                    </Row>
                    <Row className='menu'>
                      <MenuList
                        title={formatMessage(messages.createServerSidePreset)}
                        select={this.onSelect('create_external_preset')}
                      />
                      <MenuList
                        title={formatMessage(messages.createClientSidePreset)}
                        select={this.onSelect('create_tag_preset')}
                      />
                    </Row>
                  </div>
                ) : null}
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default compose<Props, AudienceFeedSelectorProps>(
  injectIntl,
  injectFeatures,
  injectWorkspace,
)(AudienceFeedSelector);
