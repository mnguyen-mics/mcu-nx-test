import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import messages from '../../List/messages';
import { FormSection } from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartReplicationRouteMatchParam } from '../domain';
import { getFormValues } from 'redux-form';
import { FORM_ID } from '../DatamartReplicationEditForm';
import { connect } from 'react-redux';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { Checkbox } from 'antd';

interface MapStateToProps {
  formValues: any;
}

type Props = InjectedIntlProps &
  MapStateToProps &
  ReduxFormChangeProps &
  ValidatorProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam> &
  NormalizerProps;

interface State {
  isActivationOn: boolean;
}

class ActivationFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isActivationOn: false };
  }

  onChange = () => {
    const { formValues, formChange } = this.props;
    if (formValues.status === 'PAUSED') {
      formChange('status', 'ACTIVE');
    } else if (formValues.status === 'ACTIVE') {
      formChange('status', 'PAUSED');
    }
  };

  render() {
    const {
      formValues,
      match: {
        params: { datamartReplicationId },
      },
    } = this.props;
    return (
      <div>
        <FormSection
          subtitle={messages.sectionActivationSubTitle}
          title={messages.sectionActivationTitle}
        />
        <Checkbox
          checked={formValues.status === 'ACTIVE'}
          onChange={this.onChange}
          disabled={!!datamartReplicationId}
        >
          <FormattedMessage
            id="settings.datamart.datamartReplication.edit.activationLabel"
            defaultMessage="Activate your Replication once it's created. Otherwise your replication will be in paused status."
          />
        </Checkbox>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ReduxFormChangeProps>(
  withRouter,
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(ActivationFormSection);
