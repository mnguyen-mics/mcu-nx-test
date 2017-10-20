import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout, Row } from 'antd';

import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons.tsx';
import { FormTitle } from '../../../../../components/Form/index.ts';
import { MenuList, MenuPresentational, MenuSubList } from '../../../../../components/FormMenu';

import messages from '../messages';

const { Content } = Layout;

const imageAdRendererId = 1;
const htmlAdRendererId = 1004;
const externalAdRendererId = 1005;
const nativeIvidenceAdRendererId = 1032;
const nativeQuantumAdRendererId = 1047;
const imageSkinsAdRendererId = 1026;

class DisplayCreativeTypePicker extends Component {

  renderNativeSubmenu = () => {
    const {
      onSelect,
      intl: {
        formatMessage
      }
    } = this.props;

    return [{
      title: formatMessage(messages.creativeTypeQuantum),
      select: () => onSelect(nativeQuantumAdRendererId)
    }, {
      title: formatMessage(messages.creativeTypeIvidence),
      select: () => onSelect(nativeIvidenceAdRendererId)
    }];
  }

  render() {
    const {
      onSelect,
      breadcrumbPaths,
      close,
      intl: {
        formatMessage
      }
    } = this.props;

    return (
      <Layout>
        <div
          className="edit-layout ant-layout"
        >
          <Actionbar path={breadcrumbPaths} edition>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.creativesTypePickerTitle}
                subTitle={messages.creativesTypePickerSubTitle}
              />
              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  <div className="presentation">
                    <MenuPresentational title={formatMessage(messages.creativeTypeImage)} type="image" select={() => onSelect(imageAdRendererId)} />
                    <div className="separator"><FormattedMessage {...messages.creativeTypeOr} /></div>
                    <MenuPresentational title={formatMessage(messages.creativeTypeHtml)} type="code" select={() => onSelect(htmlAdRendererId)} />
                  </div>
                </Row>
                <Row className="intermediate-title">
                  <FormattedMessage {...messages.creativeTypeAdvanced} />
                </Row>
                <Row className="menu">
                  <MenuList title={formatMessage(messages.creativeTypeAgency)} select={() => onSelect(externalAdRendererId)} />
                  <MenuList title={formatMessage(messages.creativeTypeSkin)} select={() => onSelect(imageSkinsAdRendererId)} />
                  <MenuSubList title={formatMessage(messages.creativeTypeNative)} subtitles={[formatMessage(messages.creativeTypeQuantum), formatMessage(messages.creativeTypeIvidence)]} submenu={this.renderNativeSubmenu()} />
                </Row>
              </Row>


            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

DisplayCreativeTypePicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,
  close: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

DisplayCreativeTypePicker = injectIntl(DisplayCreativeTypePicker);

export default DisplayCreativeTypePicker;
