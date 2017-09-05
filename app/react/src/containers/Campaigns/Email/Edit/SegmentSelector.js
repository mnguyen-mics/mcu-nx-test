import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout, Button, Checkbox } from 'antd';
import moment from 'moment';

import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../components/TableView';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import ReportService from '../../../../services/ReportService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { normalizeReportView } from '../../../../utils/MetricHelper';

const { Content } = Layout;

class SegmentSelector extends Component {

  state = {
    selectedSegmentById: {},
    audienceSegmentById: {},
    allAudienceSegmentIds: [],
    noSegment: false,
    isLoading: true,
    total: 0,
    pageSize: 10,
    currentPage: 1,
    keywords: '',
  };

  componentDidMount() {
    this.fetchAudienceSegments().then(response => {
      if (response.total === 0) {
        this.setState({
          noSegment: true,
        });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      currentPage,
      pageSize,
      keywords,
    } = this.state;
    const {
      currentPage: prevCurrentPage,
      pageSize: prevPageSize,
      keywords: prevKeywords,
    } = prevState;

    if (currentPage !== prevCurrentPage || pageSize !== prevPageSize || keywords !== prevKeywords) {
      this.fetchAudienceSegments();
    }
  }

  fetchAudienceSegments = () => {
    const { organisationId, defaultDatamart, selectedSegmentIds } = this.props;
    const { pageSize, currentPage, keywords } = this.state;

    const options = {
      ...getPaginatedApiParam(currentPage, pageSize),
    };

    if (keywords) {
      options.keywords = keywords;
    }

    const datamartId = defaultDatamart(organisationId).id;

    return AudienceSegmentService.getSegments(organisationId, datamartId, options).then(response => {

      return ReportService.getAudienceSegmentReport(
        organisationId,
        moment().subtract(1, 'days'),
        moment(),
        'audience_segment_id',
      ).then(results => {
        const segments = response.data;
        const metadata = normalizeArrayOfObject(
          normalizeReportView(results.data.report_view),
          'audience_segment_id',
        );

        const segmentsWithAdditionalMetadata = segments.map(segment => {
          const { user_points, desktop_cookie_ids } = metadata[segment.id];

          return { ...segment, user_points, desktop_cookie_ids };
        });

        const allAudienceSegmentIds = segmentsWithAdditionalMetadata.map(segment => segment.id);
        const audienceSegmentById = normalizeArrayOfObject(segmentsWithAdditionalMetadata, 'id');

        this.setState(prevState => {
          const selectedSegmentById = {
            ...prevState.selectedSegmentById,
            ...selectedSegmentIds.reduce((acc, segmentId) => {
              if (!prevState.selectedSegmentById[segmentId]) {
                return { ...acc, [segmentId]: audienceSegmentById[segmentId] };
              }
              return acc;
            }, {}),
          };

          return {
            allAudienceSegmentIds,
            audienceSegmentById,
            selectedSegmentById,
            isLoading: false,
            total: response.total,
          };
        });


        return response;
      });

    });
  }

  getColumnsDefinitions = () => {
    const { selectedSegmentById } = this.state;

    return {
      dataColumnsDefinition: [
        {
          key: 'selected',
          render: (text, record) => (
            <Checkbox
              checked={!!selectedSegmentById[record.id]}
              onChange={() => this.toggleSegmentSelection(record.id)}
            >{text}
            </Checkbox>
          ),
        },
        {
          translationKey: 'NAME',
          key: 'name',
          isHideable: false,
          render: text => <span>{text}</span>,
        },
        {
          translationKey: 'User Points',
          key: 'user_points',
          isHideable: false,
          render: text => <span>{text}</span>,
        },
        {
          translationKey: 'DESKTOP COOKIE IDS',
          key: 'desktop_cookie_ids',
          isHideable: false,
          render: text => <span>{text}</span>,
        },
      ],
      actionsColumnsDefinition: [],
    };
  }

  getSearchOptions() {
    return {
      isEnabled: true,
      placeholder: 'Search a template',
      onSearch: value => {
        this.setState({
          keywords: value,
        });
      },
    };
  }

  handleAdd = () => {
    const { save } = this.props;
    const { selectedSegmentById } = this.state;
    const selectedSegments = Object.keys(selectedSegmentById);
    save(selectedSegments);
  }

  toggleSegmentSelection = (segmentId) => {
    this.setState(prevState => {
      const isSegmentSelected = prevState.selectedSegmentById[segmentId];

      if (isSegmentSelected) {
        return {
          selectedSegmentById: Object.keys(prevState.selectedSegmentById)
            .filter(id => id !== segmentId)
            .reduce((acc, id) => {
              return { ...acc, [id]: prevState.selectedSegmentById[id] };
            }, {}),
        };
      }

      return {
        selectedSegmentById: {
          ...prevState.selectedSegmentById,
          [segmentId]: prevState.audienceSegmentById[segmentId],
        },
      };
    });
  }

  render() {
    const {
      audienceSegmentById,
      allAudienceSegmentIds,
      isLoading,
      currentPage,
      total,
      pageSize,
      noSegment,
    } = this.state;

    const pagination = {
      currentPage,
      pageSize,
      total,
      onChange: page => this.setState({ currentPage: page }),
      onShowSizeChange: (current, size) => this.setState({ pageSize: size }),
    };

    const datasource = allAudienceSegmentIds.map(id => audienceSegmentById[id]);

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: 'Add an existing template' }]} edition>
            <Button type="primary mcs-primary" onClick={this.handleAdd}>
              <McsIcons type="plus" /><span>Add</span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-table-edit-container">
              {noSegment
                ? <EmptyTableView iconType="file" />
                : <TableViewFilters
                  searchOptions={this.getSearchOptions()}
                  columnsDefinitions={this.getColumnsDefinitions()}
                  dataSource={datasource}
                  loading={isLoading}
                  pagination={pagination}
                />
              }
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

SegmentSelector.defaultProps = {
  selectedSegmentIds: [],
};

SegmentSelector.propTypes = {
  organisationId: PropTypes.string.isRequired,
  selectedSegmentIds: PropTypes.arrayOf(PropTypes.string),
  defaultDatamart: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
    }),
  ),
)(SegmentSelector);
