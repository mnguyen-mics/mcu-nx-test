import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import { MenuList } from '@mediarithmics-private/mcs-components-library';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../components/Layout/FormLayoutActionbar';
import cuid from 'cuid';
import { AudienceBuilderResource } from '../../../models/audienceBuilder/AudienceBuilderResource';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';

export const messages = defineMessages({
  title: {
    id: 'segmentBuilderSelector.title',
    defaultMessage: 'Segment Builder',
  },
  subTitle: {
    id: 'segmentBuilderSelector.subtitle',
    defaultMessage: 'Choose your Segment Builder',
  },
});

export interface AudienceBuilderSelectorProps {
  audienceBuilders: AudienceBuilderResource[];
  onSelect: (segmentBuilder: AudienceBuilderResource) => void;
  actionbarProps: FormLayoutActionbarProps;
  isMainlayout?: boolean;
}

type Props = AudienceBuilderSelectorProps & InjectedIntlProps;

class AudienceBuilderSelector extends React.Component<Props> {
  render() {
    const {
      onSelect,
      actionbarProps,
      isMainlayout,
      audienceBuilders,
    } = this.props;

    return (
      <Layout>
        {isMainlayout ? (
          <Actionbar {...actionbarProps} />
        ) : (
          <FormLayoutActionbar {...actionbarProps} />
        )}
        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          <FormTitle title={messages.title} subtitle={messages.subTitle} />

          <Row className="mcs-selector_container">
            <Row className="menu">
              {audienceBuilders.map(b => {
                const handleSelect = () => onSelect(b);
                return (
                  <MenuList key={cuid()} title={b.name} select={handleSelect} />
                );
              })}
            </Row>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AudienceBuilderSelectorProps>(injectIntl)(
  AudienceBuilderSelector,
);
