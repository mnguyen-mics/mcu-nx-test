import * as React from 'react';
import { Row, Col } from 'antd/lib/grid';
import { compose } from 'recompose';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Checkbox } from 'antd';
import {
  FormSection,
  FormInputField,
  FormSelectField,
  FormSelect,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';

const messages = defineMessages({
  sectionSubtitle: {
    id: 'goalEditor.section.attribution.model.subtitle',
    defaultMessage: 'Give your Goal attribution models.',
  },
  sectionTitle: {
    id: 'goalEditor.section..attribution.model.title',
    defaultMessage: 'Attribution Models',
  },
});

interface State {}

type Props = InjectedIntlProps & ValidatorProps;

class AttributionModelFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle}
          title={messages.sectionTitle}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(AttributionModelFormSection);
