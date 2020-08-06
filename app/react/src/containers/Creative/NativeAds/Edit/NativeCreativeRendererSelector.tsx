import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormTitle } from '../../../../components/Form';
import { MenuList } from '@mediarithmics-private/mcs-components-library';
import messages from './../../DisplayAds/Edit/messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import {
  IVIDENCE_AD_RENDERER,
  QUANTUM_AD_RENDERER,
  NATIVE_AD_RENDERER,
} from './domain';

const { Content } = Layout;

export interface NativeCreativeRendererSelectorProps {
  onSelect: (adRendererId: string) => void;
  close: () => void;
}

type Props = NativeCreativeRendererSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class NativeCreativeRendererSelector extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      intl: { formatMessage },
      onSelect,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: 'typePickerForm',
      onClose: this.props.close,
      paths: [
        {
          name: messages.nativeCreationBreadCrumb,
        },
      ],
    };

    const select = (id: string) => () => onSelect(id);

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
              {
                <Row className="mcs-selector_container">
                  <Row className="menu">
                    <MenuList
                      title={formatMessage(messages.creativeTypeNative)}
                      select={select(NATIVE_AD_RENDERER)}
                    />
                    <MenuList
                      title={formatMessage(messages.creativeTypeQuantum)}
                      select={select(QUANTUM_AD_RENDERER)}
                    />
                    <MenuList
                      title={formatMessage(messages.creativeTypeIvidence)}
                      select={select(IVIDENCE_AD_RENDERER)}
                    />
                  </Row>
                </Row>
              }
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default withRouter(injectIntl(NativeCreativeRendererSelector));
