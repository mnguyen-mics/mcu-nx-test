import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import moment from 'moment';
import {
  injectIntl,
  InjectedIntlProps
} from 'react-intl';
import * as NotificationActions from '../../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../../state/Features/selectors';
import {
  EditAudienceSegmentParam,
  AudienceSegmentFormData,
} from './domain'
import AudienceSegmentService from '../../../../services/AudienceSegmentService'
import * as DatamartService from '../../../../services/DatamartService'
import { INITIAL_AUDIENCE_SEGMENT_FORM_DATA } from '../Edit/domain'
import { AudienceSegment } from '../../../../models/audiencesegment'
import messages from './messages';
import { GeneralFormSection } from './sections/';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

interface State {
  audienceSegmentFormData: AudienceSegmentFormData;
  loading: boolean;
  damartToken: string;
  segmentType?: string
}

interface MapStateProps {
  notifyError: (err: any) => void;
  defaultDatamart: (organisationId: string) => { id: string };
}

type Props = InjectedIntlProps &
  MapStateProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class EditAudienceSegmentPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      audienceSegmentFormData: INITIAL_AUDIENCE_SEGMENT_FORM_DATA,
      damartToken: '',
    };
  }

  countDefaultLifetime = (audienceSegmentFormData: AudienceSegmentFormData) => {
    let lifetime = moment.duration(audienceSegmentFormData.audienceSegment.default_ttl, 'milliseconds').asMonths();
    if (Number.isInteger(lifetime) && lifetime > 0) {
      audienceSegmentFormData.defaultLiftime = lifetime;
      audienceSegmentFormData.defaultLiftimeUnit = 'months';
      return audienceSegmentFormData;
    } else {
      lifetime = moment.duration(audienceSegmentFormData.audienceSegment.default_ttl, 'milliseconds').asWeeks();
      if (Number.isInteger(lifetime) && lifetime > 0) {
        audienceSegmentFormData.defaultLiftime = lifetime;
        audienceSegmentFormData.defaultLiftimeUnit = 'weeks';
        return audienceSegmentFormData;
      } else {
        lifetime = moment.duration(audienceSegmentFormData.audienceSegment.default_ttl, 'milliseconds').asDays();
        audienceSegmentFormData.defaultLiftime = lifetime;
        audienceSegmentFormData.defaultLiftimeUnit = 'days';
        return audienceSegmentFormData;
      }
    }
  }

  extractSegmentType = (audienceSegment: AudienceSegment) => {

    if (audienceSegment.type === 'USER_LIST' && audienceSegment.feed_type === 'TAG') {
      return 'USER_PIXEL';
    }
    return audienceSegment.type;

  }

  componentDidMount() {
    const {
      match: { params: { segmentId: audienceSegmentIdFromURLParam, organisationId } },
      defaultDatamart,
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;
    DatamartService
      .default
      .getDatamart(datamartId)
      .then((response: any) =>
        this.setState(
          { damartToken: response.data.token }
        )

      );

    const segmentId = audienceSegmentIdFromURLParam;

    if (segmentId) {
      AudienceSegmentService
        .getSegment(segmentId)
        .then(response =>
          this.setState(prevStat => {
            const newStat = {
              ...prevStat,
              segmentType: this.extractSegmentType(response.data),
              loading: false,
            };
            newStat.audienceSegmentFormData.audienceSegment = response.data;
            newStat.audienceSegmentFormData = {
              ...
              this.countDefaultLifetime(newStat.audienceSegmentFormData)
            }
            return newStat;
          })
        ).catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    }



  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  redirectToSegmentList = () => {
    const {
        history,
      match: { params: { organisationId } }
      } = this.props

    return history.push(`/v2/o/${organisationId}/audience/segments`);
  };

  save = (audienceSegmentFormData: AudienceSegmentFormData) => {

    const {
      match: { params: { organisationId, type } },
      defaultDatamart,
      notifyError,
      history,
      intl,
   } = this.props;

    const countTTL = (formData: AudienceSegmentFormData) => {
      if (formData.defaultLiftimeUnit && formData.defaultLiftime) {
        formData.audienceSegment.default_ttl = moment.duration(Number(formData.defaultLiftime), formData.defaultLiftimeUnit).asMilliseconds();
        formData.audienceSegment.default_lifetime = moment.duration(Number(formData.defaultLiftime), formData.defaultLiftimeUnit).asMinutes();

      }
      return formData.audienceSegment;

    };

    const datamartId = defaultDatamart(organisationId).id;
    audienceSegmentFormData.audienceSegment = {
      ...countTTL(audienceSegmentFormData),
      datamart_id: datamartId,
      organisation_id: organisationId,
    };

    switch (type) {
      case 'USER_PIXEL':
        audienceSegmentFormData.audienceSegment = {
          ...audienceSegmentFormData.audienceSegment,
          type: 'USER_LIST',
          feed_type: 'TAG',
        };
    };

    this.setState({
      loading: true,
    });

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    return AudienceSegmentService.saveSegment(
      organisationId,
      audienceSegmentFormData.audienceSegment,
    )
      .then(audienceSegment => {
        hideSaveInProgress();
        const adGroupDashboardUrl = `/v2/o/${organisationId}/audience/segments`;
        history.push(adGroupDashboardUrl);
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
      });

  }

  render() {

    const {
      match: { params: { type } },
    } = this.props;

    const segmentType = type || this.state.segmentType;
    return (
      <GeneralFormSection
        initialValues={this.state.audienceSegmentFormData}
        close={this.redirectToSegmentList}
        onSubmit={this.save}
        audienceSegmentFormData={this.state.audienceSegmentFormData}
        datamartToken={this.state.damartToken}
        segmentType={segmentType}
      />
    );
  }

}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  connect(state => ({
    hasFeature: FeatureSelectors.hasFeature(state),
    defaultDatamart: getDefaultDatamart(state),
  }), {
      notifyError: NotificationActions.notifyError,
    }),
)(EditAudienceSegmentPage);

