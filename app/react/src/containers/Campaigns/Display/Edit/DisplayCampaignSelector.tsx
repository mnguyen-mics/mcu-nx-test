import * as React from 'react';
import { Layout, Row } from 'antd';
import { FormLayoutActionbar } from '../../../../components/Layout';
import { FormTitle } from '../../../../components/Form';
import { MenuPresentational } from '@mediarithmics-private/mcs-components-library';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { FormLayoutActionbarProps } from '../../../../components/Layout/FormLayoutActionbar';
import { DisplayCampaignSubType } from '../../../../models/campaign/constants';

const { Content } = Layout

export interface DisplayCampaignSelectorProps {
  onSelect: (e: DisplayCampaignSubType) => void;
  close: () => void;
}

type Props = DisplayCampaignSelectorProps & InjectedIntlProps;


const messages = defineMessages({
  displayCampaignTypePickerTitle: {
    id: 'display.campaign.edit.select.title',
    defaultMessage: 'Select Your Campaign Type'
  },
  displayCampaignTypePickerSubTitle: {
    id: 'display.campaign.edit.select.subtitle',
    defaultMessage: 'Select your campaign type, if you don\'t know which type you should use, please contact your representative.'
  },
  programmaticType: {
    id: 'display.campaign.edit.select.programmatic',
    defaultMessage: 'Programmatic'
  },
  adServingType: {
    id: 'display.campaign.edit.select.adserving',
    defaultMessage: 'Ad Serving'
  },
  displayTypeOr: {
    id: 'display.campaign.edit.select.or',
    defaultMessage: 'Or'
  },
  displayTypeAdvanced: {
    id: 'display.campaign.edit.select.advanced',
    defaultMessage: 'Advanced'
  },
  trackingType: {
    id: 'display.campaign.edit.select.tracking',
    defaultMessage: 'Tracking'
  },
  campaignSelectionBreadcrumb: {
    id: 'display.campaign.edit.select.breadcrumb',
    defaultMessage: 'New Campaign'
  }
})


class DisplayCampaignSelector extends React.Component<
  Props
> {
  public render() {

    const {
      intl: {
        formatMessage
      },
      onSelect,
      close
    } = this.props;

    const onTypeSelect = (campaignType: DisplayCampaignSubType) => () => {
      onSelect(campaignType);
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: 'typePickerForm',
      onClose: close,
      paths: [
        {
          name: formatMessage(messages.campaignSelectionBreadcrumb),
        },
      ],
    };


    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <FormLayoutActionbar {...actionBarProps} />
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.displayCampaignTypePickerTitle}
              />

              <Row className="mcs-selector_container">
                <Row className="menu">
                  <div className="presentation">
                    <MenuPresentational
                      title={formatMessage(messages.programmaticType)}
                      type="image"
                      select={onTypeSelect('PROGRAMMATIC')}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.displayTypeOr} />
                    </div>
                    <MenuPresentational
                      title={formatMessage(messages.adServingType)}
                      type="code"
                      select={onTypeSelect('AD_SERVING')}
                    />
                  </div>
                </Row>
                { /* to be uncommented when this feature is available */ }
                {/* <Row className="intermediate-title">
                  <FormattedMessage {...messages.displayTypeAdvanced} />
                </Row>
                <Row className="menu">
                  <MenuList
                    title={formatMessage(messages.trackingType)}
                    select={onTypeSelect('TRACKING')}
                  />
                </Row> */}
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default compose<Props, DisplayCampaignSelectorProps>(
  injectIntl
)(DisplayCampaignSelector)
