import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import AudienceSegmentHeader from './AudienceSegmentHeader';
import { Labels } from '../../../Labels/index';
import AudienceSegmentDashboard from './AudienceSegmentDashboard';
import LookalikeStatusWarning from './Lookalike/LookalikeStatusWarning';

import * as AudienceSegmentActions from '../../../../state/Audience/Segments/actions';

import { SEGMENT_QUERY_SETTINGS } from './constants';

import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';

export interface AudienceSegmentStoreProps {
  loadAudienceSegmentSingleDataSource: (
    segmentId: string,
    organisationId: string,
    filters: any,
  ) => void;
  resetAudienceSegmentSingle: () => void;
}

type Props = AudienceSegmentStoreProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps;

class AudienceSegment extends React.Component<Props> {
  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId, segmentId } },
      loadAudienceSegmentSingleDataSource,
    } = this.props;

    if (!isSearchValid(search, SEGMENT_QUERY_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, SEGMENT_QUERY_SETTINGS),
      });
    } else {
      const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);
      loadAudienceSegmentSingleDataSource(segmentId, organisationId, filter);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      match: { params: { segmentId, organisationId } },
      history,
      loadAudienceSegmentSingleDataSource,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch },
      match: {
        params: {
          segmentId: nextSegmentId,
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    if (
      !compareSearches(search, nextSearch) ||
      segmentId !== nextSegmentId ||
      organisationId !== nextOrganisationId
    ) {
      if (organisationId !== nextOrganisationId) {
        history.push(`/v2/o/${nextOrganisationId}/audience/segments`);
      }
      if (!isSearchValid(nextSearch, SEGMENT_QUERY_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, SEGMENT_QUERY_SETTINGS),
        });
      } else {
        const filter = parseSearch(nextSearch, SEGMENT_QUERY_SETTINGS);

        loadAudienceSegmentSingleDataSource(
          nextSegmentId,
          nextOrganisationId,
          filter,
        );
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAudienceSegmentSingle();
  }

  render() {
    const { match: { params: { segmentId, organisationId } } } = this.props;
    return (
      <div>
        <AudienceSegmentHeader />
        <Labels
          labellableId={segmentId}
          labellableType="SEGMENT"
          organisationId={organisationId}
        />
        <LookalikeStatusWarning />
        <AudienceSegmentDashboard />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
});

const mapDispatchToProps = {
  loadAudienceSegmentSingleDataSource:
    AudienceSegmentActions.loadAudienceSegmentSingleDataSource,
  resetAudienceSegmentSingle: AudienceSegmentActions.resetAudienceSegmentSingle,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AudienceSegment);
