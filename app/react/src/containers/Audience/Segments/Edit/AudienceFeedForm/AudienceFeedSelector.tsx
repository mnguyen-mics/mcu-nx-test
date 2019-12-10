import * as React from 'react';
import { Layout, Row } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import { defineMessages, FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { MenuPresentational, MenuList } from '../../../../../components/FormMenu';
import { FeedAction } from './domain';
import { compose } from 'recompose';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';

const { Content } = Layout;

export interface AudienceFeedSelectorProps {
  onSelect: (feedType: FeedAction) => void;
}

type Props = AudienceFeedSelectorProps & InjectedIntlProps & InjectedFeaturesProps;

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
    defaultMessage: 'Advanced'
  },
  createServerSidePreset: {
    id: 'audience.segments.form.audienceFeedSelector.createServerSidePreset',
    defaultMessage: 'Create a server side preset',
  },
  createClientSidePreset: {
    id: 'audience.segments.form.audienceFeedSelector.createClientSidePreset',
    defaultMessage: 'Create a client side preset',
  }
});

class AudienceFeedSelector extends React.Component<Props> {
  onSelect = (feedType: FeedAction) => () => {
    this.props.onSelect(feedType)
  }

  render() {
    const {
      intl: { formatMessage },
      hasFeature,
    } = this.props;

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.listTitle}
                subtitle={messages.listSubtitle}
              />
              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  <div className="presentation">
                    <MenuPresentational
                      title={'Server side'}
                      subtitles={['Triggered when users are added / deleted from segment']}
                      type="data"
                      select={this.onSelect('create_external')}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.segmentTypeOr} />
                    </div>
                    <MenuPresentational
                      title={'Client side'}
                      subtitles={['Triggered when users are visiting your webpages / apps']}
                      type="code"
                      select={this.onSelect('create_tag')}
                    />
                  </div>
                </Row>
                {/* TODO DISPLAY WHEN CREATING PRESETS IS FINISHED */}
                { hasFeature("plugins-presets") && false ?
                  <div>
                    <Row className="intermediate-title">
                      <FormattedMessage {...messages.feedAdvanced} />
                    </Row>
                    <Row className="menu">
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
                  : null
                }
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default compose<Props, AudienceFeedSelectorProps>(injectIntl, injectFeatures)(AudienceFeedSelector)
