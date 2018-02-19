import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import moment from 'moment';
import {
  injectIntl,
  InjectedIntlProps
} from 'react-intl';
import {
  EditAudienceSegmentParam,
  AudienceSegmentFormData,
  DefaultLiftimeUnit,
} from './domain'
import AudienceSegmentService from '../../../../services/AudienceSegmentService'
import { INITIAL_AUDIENCE_SEGMENT_FORM_DATA } from '../Edit/domain'
import { AudienceSegment } from '../../../../models/audiencesegment'
import messages from './messages';
import { GeneralFormSection } from './sections/';
import injectDatamart, { InjectedDatamartProps } from '../../../Datamart/injectDatamart';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';

interface State {
  audienceSegmentFormData: AudienceSegmentFormData;
  segmentType?: string;
  segmentCreation: boolean
}

type Props = InjectedIntlProps &
  InjectedDatamartProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

const INITIAL_STATE = {
  audienceSegmentFormData: INITIAL_AUDIENCE_SEGMENT_FORM_DATA,
  segmentCreation: true
}
class EditAudienceSegmentPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;

  }

  countDefaultLifetime = (audienceSegment: AudienceSegment): {
    defaultLiftime?: number,
    defaultLiftimeUnit?: DefaultLiftimeUnit,
  } => {
    let lifetime = moment.duration(audienceSegment.default_ttl, 'milliseconds').asMonths();
    if (Number.isInteger(lifetime) && lifetime > 0) {

      return {
        defaultLiftime: lifetime,
        defaultLiftimeUnit: 'months'
      }
    } else {
      lifetime = moment.duration(audienceSegment.default_ttl, 'milliseconds').asWeeks();
      if (Number.isInteger(lifetime) && lifetime > 0) {
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'weeks'
        }
      } else {
        lifetime = moment.duration(audienceSegment.default_ttl, 'milliseconds').asDays();
        return {
          defaultLiftime: lifetime,
          defaultLiftimeUnit: 'days'
        }
      }
    }
  }

  extractSegmentType = (audienceSegment: AudienceSegment) => {

    if (audienceSegment.type === 'USER_LIST' && audienceSegment.feed_type === 'TAG') {
      return 'USER_PIXEL';
    }
    return audienceSegment.type;

  }

  initialLoading = (props: Props) => {
    const {
      match: { params: { segmentId } },
    } = props;

    if (segmentId) {
      AudienceSegmentService
        .getSegment(segmentId)
        .then(response =>
          this.setState(prevStat => {
            const newStat = {
              ...prevStat,
              segmentType: this.extractSegmentType(response.data),
              segmentCreation: false,
              audienceSegmentFormData: {
                ...prevStat.audienceSegmentFormData,
                audienceSegment: response.data,
                ...this.countDefaultLifetime(response.data),
              }
            };
            return newStat;
          })
        ).catch(err => {
          props.notifyError(err);
        });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: { params: { segmentId } },
    } = this.props;
    const {
      match: { params: { segmentId: nextSegmentId } },
    } = nextProps;
    if (segmentId === undefined && nextSegmentId) {
      this.initialLoading(nextProps);
    }

  }

  componentDidMount() {
    this.initialLoading(this.props)
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
      datamart,
      notifyError,
      history,
      intl,
   } = this.props;

    const countTTL = (formData: AudienceSegmentFormData) => {
      if (formData.defaultLiftimeUnit && formData.defaultLiftime) {
        return moment.duration(Number(formData.defaultLiftime), formData.defaultLiftimeUnit).asMilliseconds();
      }
      return undefined;

    };

    const fillTechnicalNameForUserPixel = (formData: AudienceSegmentFormData) => {
      const technicalName = formData.audienceSegment.technical_name;
      if(formData.audienceSegment.type === 'USER_LIST' && formData.audienceSegment.feed_type === 'TAG'){
        if (technicalName === undefined || technicalName === null || technicalName === '') {
          return `${formData.audienceSegment.name}-${moment().unix()}`;
        }
      }

      return technicalName
    }

    const datamartId = datamart.id;

    switch (type) {
      case 'USER_PIXEL':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...audienceSegmentFormData.audienceSegment,
            type: 'USER_LIST',
            feed_type: 'TAG',
          }
        };
        break;
      case 'USER_LIST':
        audienceSegmentFormData = {
          ...audienceSegmentFormData,
          audienceSegment: {
            ...audienceSegmentFormData.audienceSegment,
            type: 'USER_LIST',
            feed_type: 'FILE_IMPORT',
          }
        };
    };

    const audienceSegment = {
      ...audienceSegmentFormData.audienceSegment,
      default_ttl: countTTL(audienceSegmentFormData),
      technical_name: fillTechnicalNameForUserPixel(audienceSegmentFormData),
      datamart_id: datamartId,
      organisation_id: organisationId,
    }
    audienceSegmentFormData = {
      ...audienceSegmentFormData,
      audienceSegment: audienceSegment
    };

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const {
      segmentCreation
    } = this.state

    if (segmentCreation) {
      return AudienceSegmentService.saveSegment(
        organisationId,
        audienceSegmentFormData.audienceSegment,
      )
        .then(response => {
          hideSaveInProgress();
          const adGroupDashboardUrl = audienceSegmentFormData.audienceSegment.feed_type === 'TAG' ? `/v2/o/${organisationId}/audience/segments/${response.data.id}/edit` : `/v2/o/${organisationId}/audience/segments/${response.data.id}`;
          history.push(adGroupDashboardUrl);
        })
        .catch(err => {
          hideSaveInProgress();
          notifyError(err);
        });
    } else {

      const {
        match: { params: { segmentId } },
      } = this.props
      return AudienceSegmentService.updateAudienceSegment(
        segmentId,
        audienceSegmentFormData.audienceSegment,
      )
        .then(response => {
          hideSaveInProgress();
          const adGroupDashboardUrl = `/v2/o/${organisationId}/audience/segments/${segmentId}`;
          history.push(adGroupDashboardUrl);
        })
        .catch(err => {
          hideSaveInProgress();
          notifyError(err);
        });

    }

  }

  render() {

    const {
      match: { params: { type } },
      datamart
    } = this.props;

    const {
      segmentCreation
    } = this.state
    const segmentType = type || this.state.segmentType;
    return (
      <GeneralFormSection
        initialValues={this.state.audienceSegmentFormData}
        close={this.redirectToSegmentList}
        onSubmit={this.save}
        audienceSegmentFormData={this.state.audienceSegmentFormData}
        datamartToken={datamart.token}
        segmentType={segmentType}
        segmentCreation={segmentCreation}
      />
    );
  }

}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDatamart,
  injectNotifications,
)(EditAudienceSegmentPage);

