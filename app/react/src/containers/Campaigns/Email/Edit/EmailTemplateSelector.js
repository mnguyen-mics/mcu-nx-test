import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Layout, Button, Checkbox } from 'antd';

import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import {
  EmptyTableView,
  TableView,
  TableViewFilters
} from '../../../../components/TableView';
import CreativeService from '../../../../services/CreativeService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';

const { Content } = Layout;

class EmailTemplateSelector extends Component {
  constructor(props) {
    super(props);
    this.handleAdd = this.handleAdd.bind(this);
    this.fetchEmailTemplate = this.fetchEmailTemplate.bind(this);

    this.state = {
      selectedTemplates: props.selectedTemplates,
      emailTemplates: [],
      hasEmailTemplates: true,
      isLoading: true,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      keywords: ''
    };
  }

  fetchEmailTemplate() {
    const { organisationId } = this.props;
    const { pageSize, currentPage, keywords } = this.state;

    const options = {
      ...getPaginatedApiParam(currentPage, pageSize),
    };

    if (keywords) {
      options.keywords = keywords;
    }

    return CreativeService.getEmailTemplates(organisationId, options).then(response => {
      this.setState(prevState => ({
        ...prevState,
        emailTemplates: response.data,
        isLoading: false,
        total: response.total
      }));
      return response;
    });
  }

  componentDidMount() {
    this.fetchEmailTemplate().then(response => {
      if (response.total === 0) {
        this.setState(prevState => ({
          ...prevState,
          hasEmailTemplates: false
        }));
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      currentPage,
      pageSize,
      keywords
    } = this.state;
    const {
      currentPage: prevCurrentPage,
      pageSize: prevPageSize,
      keywords: prevKeywords
    } = prevState;

    if (currentPage !== prevCurrentPage || pageSize !== prevPageSize || keywords !== prevKeywords) {
      this.fetchEmailTemplate();
    }
  }

  toggleTemplateSelection(emailTemplate) {
    // Only one template can be selected for now
    this.setState(prevState => ({
      ...prevState,
      selectedTemplates: [emailTemplate]
    }));
  }

  handleAdd() {
    const { save } = this.props;
    const { selectedTemplates } = this.state;
    save(selectedTemplates);
  }

  getColumnsDefinitions() {
    const { selectedTemplates } = this.state;
    return {
      dataColumnsDefinition: [
        {
          key: 'selected',
          render: (text, record) => <Checkbox checked={selectedTemplates.map(obj => obj.id).includes(record.id)} onChange={() => this.toggleTemplateSelection(record)}>{text}</Checkbox>
        },
        {
          translationKey: 'PREVIEW',
          key: 'asset_path',
          isHiddable: false,
          className: 'mcs-table-image-col',
          render: (text, record) => (
            <div className="mcs-table-cell-thumbnail">
              <a target="_blank" rel="noreferrer noopener" href={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`}>
                <span className="thumbnail-helper" /><img src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} />
              </a>
            </div>
        )
        },
        {
          translationKey: 'NAME',
          key: 'name',
          isHiddable: false,
          render: text => <span>{text}</span>
        },
        {
          translationKey: 'AUDIT_STATUS',
          key: 'audit_status',
          isHiddable: false,
          render: text => <span>{text}</span>
        },
        {
          translationKey: 'PUBLISHED_VERSION',
          key: 'published_version',
          isHiddable: false,
          render: text => <span>{text}</span>
        }
      ],
      actionsColumnsDefinition: []
    };
  }

  getSearchOptions() {
    return {
      isEnabled: true,
      placeholder: 'Search a template',
      onSearch: value => {
        this.setState(prevState => ({
          ...prevState,
          keywords: value
        }));
      }
    };
  }

  render() {
    const {
      emailTemplates,
      isLoading,
      currentPage,
      total,
      pageSize,
      hasEmailTemplates
    } = this.state;

    const pagination = {
      currentPage,
      pageSize,
      total,
      onChange: page =>
        this.setState(prevState => ({
          ...prevState,
          currentPage: page
        })),
      onShowSizeChange: (current, size) =>
        this.setState(prevState => ({
          ...prevState,
          pageSize: size
        }))
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: 'Add an existing template' }]}>
            <Button type="primary" onClick={this.handleAdd}>
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
            <Content className="mcs-content-container">
              {hasEmailTemplates
                ? <TableViewFilters
                  searchOptions={this.getSearchOptions()}
                >
                  <TableView
                    columnsDefinitions={this.getColumnsDefinitions()}
                    dataSource={emailTemplates}
                    loading={isLoading}
                    pagination={pagination}
                  />
                </TableViewFilters>
                : <EmptyTableView iconType="file" />}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

EmailTemplateSelector.defaultProps = {
  selectedTemplates: []
};

EmailTemplateSelector.propTypes = {
  organisationId: PropTypes.string.isRequired,
  selectedTemplates: PropTypes.arrayOf(PropTypes.object),
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
};

export default compose(
  withMcsRouter
)(EmailTemplateSelector);
