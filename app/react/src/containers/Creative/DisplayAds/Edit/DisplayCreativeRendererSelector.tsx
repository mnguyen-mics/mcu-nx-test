import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';

import { FormTitle } from '../../../../components/Form';
import {
  MenuList,
  MenuPresentational,
  MenuSubList,
} from '../../../../components/FormMenu';
import messages from './messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';

// import { FormSectionProps } from './DispayCreativeForm';

const { Content } = Layout;

const imageAdRendererId = '1';
const htmlAdRendererId = '1004';
const externalAdRendererId = '1005';
const nativeIvidenceAdRendererId = '1032';
const nativeQuantumAdRendererId = '1047';
const imageSkinsAdRendererId = '1026';

export interface DisplayCreativeRendererSelectorProps {
  onSelect: (id: string) => void;
  close: () => void;
}

type JoinedProps = DisplayCreativeRendererSelectorProps & InjectedIntlProps;

class DisplayCreativeRendererSelector extends React.Component<JoinedProps> {

  renderNativeSubmenu = () => {
    const { onSelect, intl: { formatMessage } } = this.props;

    return [
      {
        title: formatMessage(messages.creativeTypeQuantum),
        select: () => onSelect(nativeQuantumAdRendererId),
      },
      {
        title: formatMessage(messages.creativeTypeIvidence),
        select: () => onSelect(nativeIvidenceAdRendererId),
      },
    ];
  };

  render() {
    const { onSelect, intl: { formatMessage } } = this.props;

    const onTypeSelect = (adRendererId: string) => () => {
      onSelect(adRendererId);
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: 'typePickerForm',
      // message: messages.saveCreative,
      onClose: this.props.close,
      paths: [{
        name: messages.creativeCreationBreadCrumb,
      }],
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
        <FormLayoutActionbar {...actionBarProps} />
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.creativesTypePickerTitle}
                subtitle={messages.creativesTypePickerSubTitle}
              />
              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  <div className="presentation">
                    <MenuPresentational
                      title={formatMessage(messages.creativeTypeImage)}
                      type="image"
                      select={onTypeSelect(imageAdRendererId)}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.creativeTypeOr} />
                    </div>
                    <MenuPresentational
                      title={formatMessage(messages.creativeTypeHtml)}
                      type="code"
                      select={onTypeSelect(htmlAdRendererId)}
                    />
                  </div>
                </Row>
                <Row className="intermediate-title">
                  <FormattedMessage {...messages.creativeTypeAdvanced} />
                </Row>
                <Row className="menu">
                  <MenuList
                    title={formatMessage(messages.creativeTypeAgency)}
                    select={onTypeSelect(externalAdRendererId)}
                  />
                  <MenuList
                    title={formatMessage(messages.creativeTypeSkin)}
                    select={onTypeSelect(imageSkinsAdRendererId)}
                  />
                  <MenuSubList
                    title={formatMessage(messages.creativeTypeNative)}
                    subtitles={[
                      formatMessage(messages.creativeTypeQuantum),
                      formatMessage(messages.creativeTypeIvidence),
                    ]}
                    submenu={this.renderNativeSubmenu()}
                  />
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default injectIntl(DisplayCreativeRendererSelector);
