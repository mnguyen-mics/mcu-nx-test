import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout, Button, Checkbox } from 'antd';

import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons.tsx';
import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../components/TableView/index.ts';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { formatMetric } from '../../../../utils/MetricHelper';
import messages from './messages';

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
    const { organisationId, defaultDatamart, selectedIds } = this.props;
    const { pageSize, currentPage, keywords } = this.state;
    const datamartId = defaultDatamart(organisationId).id;
    const options = { ...getPaginatedApiParam(currentPage, pageSize) };

    if (keywords) {
      options.keywords = keywords;
    }

    return AudienceSegmentService.getSegmentsWithMetadata(organisationId, datamartId, options)
      .then(response => {
        const segments = response.data;
        const allAudienceSegmentIds = segments.map(segment => segment.id);
        const audienceSegmentById = normalizeArrayOfObject(segments, 'id');

        this.setState(prevState => {
          const selectedSegmentById = {
            ...prevState.selectedSegmentById,
            ...selectedIds.reduce((acc, segmentId) => {
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
          intlMessage: messages.segmentTitleColumn1,
          key: 'name',
          isHideable: false,
          render: text => <span>{text}</span>,
        },
        {
          intlMessage: messages.segmentTitleColumn2,
          key: 'user_points',
          isHideable: false,
          render: text => <span>{text === '-' ? text : formatMetric(text, '0,0')}</span>,
        },
        {
          intlMessage: messages.segmentTitleColumn3,
          key: 'desktop_cookie_ids',
          isHideable: false,
          render: text => <span>{text === '-' ? text : formatMetric(text, '0,0')}</span>,
        },
      ],
      actionsColumnsDefinition: [],
    };
  }

  getSearchOptions() {
    return {
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
          <Actionbar path={[{ name: 'Add an audience' }]} edition>
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
  selectedIds: [],
};

SegmentSelector.propTypes = {
  close: PropTypes.func.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  save: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
    }),
  ),
)(SegmentSelector);
