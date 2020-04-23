import * as React from 'react';
import { Layout, Row } from 'antd';
import {
  defineMessages,
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
} from 'react-intl';
import { FormTitle } from '../../../../../components/Form';
import { MenuList } from '../../../../../components/FormMenu';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { Loading } from '../../../../../components';

const messages = defineMessages({
  title: {
    id: 'audience.partitions.selector.title',
    defaultMessage: 'Partitions',
  },
  subTitle: {
    id: 'audience.partitions.selector.subtitle',
    defaultMessage: 'Choose your partition',
  },
  noName: {
    id: 'audience.partitions.selector.noName',
    defaultMessage: 'No name',
  },
});

export interface PartitionSelectorProps {
  partitions: AudiencePartitionResource[];
  isLoading: boolean;
  onSelect: (partition: AudiencePartitionResource) => void;
  actionbarProps: FormLayoutActionbarProps;
}

type Props = PartitionSelectorProps & InjectedIntlProps;

class PartitionSelector extends React.Component<Props> {
  render() {
    const {
      partitions,
      isLoading,
      onSelect,
      actionbarProps,
      intl,
    } = this.props;

    return isLoading ? (
      <Loading className="loading-full-screen" />
    ) : (
      <Layout>
        <FormLayoutActionbar {...actionbarProps} />

        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          <FormTitle title={messages.title} subtitle={messages.subTitle} />
          <Row className="mcs-selector_container">
            <Row className="menu">
              {partitions.length === 0 ? (
                <FormattedMessage
                  id="audience.segments.experimentation.form.noPartition"
                  defaultMessage="You need a partition to create a Experimentation, please contact your support to create one."
                />
              ) : (
                partitions.map(p => {
                  const handleSelect = () => onSelect(p);
                  const partitionName =
                    p.name || intl.formatMessage(messages.noName);
                  return (
                    <MenuList
                      key={p.id}
                      title={`${partitionName} (Type: ${p.type}, Count: ${p.part_count})`}
                      select={handleSelect}
                    />
                  );
                })
              )}
            </Row>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}

export default injectIntl(PartitionSelector);
