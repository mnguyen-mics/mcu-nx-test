import * as React from 'react';
import { Layout, Row } from 'antd';
import { FormLayoutActionbar } from '../../../../components/Layout';
import { FormTitle } from '../../../../components/Form';
import { MenuPresentational } from '../../../../components/FormMenu';
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
    defaultMessage: 'Select Your Campaign Type'
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
  Props,
  any
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
          name: messages.campaignSelectionBreadcrumb,
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
                subtitle={messages.displayCampaignTypePickerSubTitle}
              />

              <Row style={{ width: '650px', display: 'inline-block' }}>
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
