import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components/index.ts';
import messages from '../../messages';
import AudienceSegmentService from '../../../../../../services/AudienceSegmentService';
import { getDefaultDatamart } from '../../../../../../state/Session/selectors';
import { getPaginatedApiParam } from '../../../../../../utils/ApiHelper';
import RelatedRecordTable from '../../../../../RelatedRecordTable.tsx';
import { formatMetric } from '../../../../../../utils/MetricHelper';

const { FormSection } = Form;

class Audience extends Component {

  state = { loading: false }

  getAudience = (filterOptions) => {
    const { organisationId, defaultDatamart } = this.props;
    const { currentPage, keywords, pageSize } = filterOptions;
    const datamartId = defaultDatamart(organisationId).id;
    const params = getPaginatedApiParam(currentPage, pageSize);

    if (keywords) {
      params.name = keywords;
    }

    return AudienceSegmentService.getSegmentsWithMetadata(organisationId, datamartId, params);
  }

  openWindow = () => {
    const { formValues, handlers } = this.props;
    const selectedIds = formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);

    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleUserPoints,
        key: 'user_points',
        isHideable: false,
        render: text => <span>{formatMetric(text, '0,0')}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleCookieIds,
        key: 'desktop_cookie_ids',
        isHideable: false,
        render: text => <span>{formatMetric(text, '0,0')}</span>,
      },
    ];

    const additionalProps = {
      actionBarTitle: 'Add an Audience',
      close: handlers.closeNextDrawer,
      columnsDefinitions,
      displayFiltering: true,
      fetchSelectorData: this.getAudience,
      save: this.updateData,
      selectedIds,
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  updateData = (selectedIds) => {
    const { formValues, handlers, organisationId } = this.props;
    const fetchSelectedSegments = Promise.all(selectedIds.map(segmentId => {
      return AudienceSegmentService.getSegment(segmentId);
    }));
    const fetchMetadata = AudienceSegmentService.getSegmentMetaData(organisationId);

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    Promise.all([fetchSelectedSegments, fetchMetadata])
      .then(results => {
        const segments = results[0];
        const metadata = results[1];

        return segments.map(segment => {
          const { desktop_cookie_ids, user_points } = metadata[segment.id];
          const prevSeg = formValues.find(elem => elem.id === segment.id);
          const include = (prevSeg ? prevSeg.include : true);

          return { ...segment, desktop_cookie_ids, include, user_points };
        });
      })
      .then(newFields => {
        handlers.updateTableFields({ newFields, tableName: 'audienceTable' });
        this.setState({ loading: false });
      });
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;

    const dataSource = formValues.reduce((tableData, segment, index) => {
      return (!segment.toBeRemoved
        ? [
          ...tableData,
          {
            key: segment.modelId,
            type: { image: 'users' },
            info: [
              segment.name,
              `${formatMetric(segment.user_points, '0,0')} ${formatMessage(messages.contentSectionAudienceMedium1)}`,
              `${formatMetric(segment.desktop_cookie_ids, '0,0')} ${formatMessage(messages.contentSectionAudienceMedium2)}`,
            ],
            include: { bool: segment.include, index },
            toBeRemoved: index,
          }
        ]
        : tableData
      );
    }, []);

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitleAudience}
          title={messages.sectionTitleAudience}
        />

        <FieldArray
          component={RelatedRecordTable}
          dataSource={dataSource}
          loading={this.state.loading}
          name="audienceTable"
          tableName="audienceTable"
          updateTableFieldStatus={handlers.updateTableFieldStatus}
        />

        {!dataSource.length
          ? <EmptyRecords
            iconType="users"
            message={formatMessage(messages.contentSectionAudienceEmptyTitle)}
          />
          : null
        }
      </div>
    );
  }
}

Audience.defaultProps = {
  formValues: [],
};

Audience.propTypes = {
  defaultDatamart: PropTypes.func.isRequired,
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFields: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired,
};

export default compose(
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
    }),
  ),
)(Audience);
