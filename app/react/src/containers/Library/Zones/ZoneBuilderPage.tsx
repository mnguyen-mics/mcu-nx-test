import * as React from 'react';
import ZoneBuilderForm from './ZoneBuilderForm';
import { ZoneBuilderFormData } from './domain';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Path } from '../../../components/ActionBar';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

export interface ZoneBuilderPageProps {
}

interface State {
  showStep2: boolean;
  zone?: GeoJSON.FeatureCollection;
}

const messages = defineMessages({
  zones: {
    id: 'zone.edit.breadcrumb.zones',
    defaultMessage: 'Zones'
  },
  create: {
    id: 'zone.edit.breadcrumb.create',
    defaultMessage: 'Create New Zone'
  },
  edit: {
    id: 'zone.edit.breadcrumb.edit',
    defaultMessage: 'Edit {name}'
  },
})

type Props = ZoneBuilderPageProps & RouteComponentProps<{ organisationId: string, zoneId: string }> & InjectedIntlProps;

class ZoneBuilderPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      showStep2: false
    }
  }

  render() {

    const {
      match: {
        params: {
          organisationId,
          zoneId
        }
      },
      history,
      intl,
    } = this.props;

    const onClose = () => history.push(`/v2/o/${organisationId}/library/zone`);

    const onSave = (e: ZoneBuilderFormData) => {
      if (!this.state.showStep2) {
        return this.setState({ showStep2: true })
      }
      // handle save here
    }

    const onStep2Abort = () => this.setState({ showStep2: false })

    const onDrawChange = (data: GeoJSON.FeatureCollection) => this.setState({ zone: data })

    const breadCrumbPaths: Path[] = [{
      name: intl.formatMessage(messages.zones),
      path: `/v2/o/${organisationId}/library/zone`
    }, zoneId ? {
      name: intl.formatMessage(messages.edit, { name: '' }),
    } : {
      name: intl.formatMessage(messages.create),
    }]

    return (
      <ZoneBuilderForm
        onClose={onClose}
        onSave={onSave}
        breadCrumbPaths={breadCrumbPaths}
        showStep2={this.state.showStep2}
        onStep2Abort={onStep2Abort}
        onDrawChange={onDrawChange}
      />
    );
  }
}

export default compose<Props, ZoneBuilderPageProps>(
  withRouter,
  injectIntl
)(ZoneBuilderPage);