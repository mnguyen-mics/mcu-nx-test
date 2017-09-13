import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Layout, Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import {
  EmptyTableView,
  TableViewFilters,
  CollectionView,
} from '../../../../components/TableView';
import CreativeService from '../../../../services/CreativeService';
import CreativeCard from './CreativeCard';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import messages from './messages';

const { Content } = Layout;

class EmailTemplateSelector extends Component {

  constructor(props) {
    super(props);

    this.state = {
      newEmailTemplateSelections: props.emailTemplateSelections,
      emailTemplates: [],
      hasEmailTemplates: true,
      isLoading: true,
      total: 0,
      pageSize: 12,
      currentPage: 1,
      keywords: '',
    };
  }

  fetchEmailTemplate = () => {
    const { organisationId } = this.props;
    const { pageSize, currentPage, keywords } = this.state;

    const options = {
      ...getPaginatedApiParam(currentPage, pageSize),
    };

    if (keywords) {
      options.keywords = keywords;
    }

    return CreativeService.getEmailTemplates(organisationId, options).then(response => {
      this.setState({
        emailTemplates: response.data,
        isLoading: false,
        total: response.total,
      });
      return response;
    });
  }

  componentDidMount() {
    this.fetchEmailTemplate().then(response => {
      if (response.total === 0) {
        this.setState(prevState => ({
          ...prevState,
          hasEmailTemplates: false,
        }));
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
      this.fetchEmailTemplate();
    }
  }

  toggleTemplateSelection(emailTemplateId) {
    // Only one template can be selected for now
    // So we juste update email_template_id
    const { emailTemplateSelections } = this.props;

    let newSelection = { email_template_id: emailTemplateId };

    const existingSelection = emailTemplateSelections[0];
    if (existingSelection) {
      newSelection = {
        ...existingSelection,
        ...newSelection,
      };
    }

    this.setState({
      newEmailTemplateSelections: [newSelection],
    });
  }

  handleAdd = () => {
    const { save } = this.props;
    const { newEmailTemplateSelections } = this.state;
    save(newEmailTemplateSelections);
  }


  getColumnsDefinitions() {
    const { newEmailTemplateSelections } = this.state;
    const selectedEmailTemplateIds = newEmailTemplateSelections
      .map(templateSelection => templateSelection.email_template_id);

    return {
      title: {
        key: 'name',
        render: (text) => {
          return <span>{text}</span>;
        }
      },
      footer: {
        key: 'selected',
        render: (text, record) => {
          return selectedEmailTemplateIds.includes(record.id) ? <Button type="primary" className="mcs-primary"><FormattedMessage {...messages.blastTemplateSelectedButton} /></Button> : <Button onClick={() => this.toggleTemplateSelection(record.id)}><FormattedMessage {...messages.blastTemplateSelectButton} /></Button>;
        }
      }
    };
  }

  buildCollectionItems = (dataSource) => {
    const columnDef = this.getColumnsDefinitions();
    if (dataSource) {
      return dataSource.map(data => {
        return <CreativeCard item={data} title={columnDef.title} footer={columnDef.footer} />;
      });
    }
    return null;
  }

  getSearchOptions() {
    return {
      isEnabled: true,
      placeholder: 'Search a template',
      onSearch: value => {
        this.setState(prevState => ({
          ...prevState,
          keywords: value,
        }));
      },
    };
  }

  render() {
    const {
      emailTemplates,
      isLoading,
      currentPage,
      total,
      pageSize,
      hasEmailTemplates,
    } = this.state;

    const pagination = {
      size: 'small',
      showSizeChanger: true,
      className: 'ant-table-pagination mini',
      current: currentPage,
      pageSize,
      total,
      onChange: page =>
        this.setState(prevState => ({
          ...prevState,
          currentPage: page,
        })),
      onShowSizeChange: (current, size) =>
        this.setState(prevState => ({
          ...prevState,
          pageSize: size,
        })),
      pageSizeOptions: ['12', '24', '36', '48'],
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: 'Add an existing template' }]} edition>
            <Button type="primary mcs-primary" onClick={this.handleAdd}>
              <McsIcons type="plus" /><span><FormattedMessage {...messages.blastTemplateAddButton} /></span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-edit-container">
              {hasEmailTemplates ?
                <TableViewFilters searchOptions={this.getSearchOptions()}>
                  <CollectionView
                    collectionItems={this.buildCollectionItems(emailTemplates)}
                    loading={isLoading}
                    pagination={pagination}
                  />
                </TableViewFilters> : <EmptyTableView iconType="file" />}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

EmailTemplateSelector.defaultProps = {
  emailTemplateSelections: [],
};

EmailTemplateSelector.propTypes = {
  organisationId: PropTypes.string.isRequired,
  emailTemplateSelections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    email_template_id: PropTypes.string.isRequired,
  })),
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
)(EmailTemplateSelector);
