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
  CollectionViewFilters,
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

  buildCollectionItems = (dataSource) => {
    const columnDef = this.getColumnsDefinitions();
    if (dataSource) {
      return dataSource.map(data => {
        return <CreativeCard item={data} title={columnDef.title} footer={columnDef.footer} />;
      });
    }
    return null;
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
          const isSelected = selectedEmailTemplateIds.includes(record.id);
          const message = (isSelected ? 'blastTemplateSelectedButton' : 'blastTemplateSelectButton');
          const buttonProps = {
            className: (isSelected ? 'mcs-primary' : ''),
            onClick: () => this.toggleTemplateSelection(record.id),
            type: (isSelected ? 'primary' : ''),
          };

          return (
            <Button {...buttonProps}>
              <FormattedMessage {...messages[message]} />
            </Button>
          );
        }
      }
    };
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

  handleAdd = () => {
    const { save } = this.props;
    const { newEmailTemplateSelections } = this.state;
    save(newEmailTemplateSelections);
  }

  toggleTemplateSelection(emailTemplateId) {
    this.setState(prevState => {
      const { newEmailTemplateSelections } = this.state;
      const isElementSelected = prevState.newEmailTemplateSelections.find(selection => selection.email_template_id === emailTemplateId);
      const newSelection = { email_template_id: emailTemplateId };

      if (this.props.singleSelection) {
        return {
          newEmailTemplateSelections: (!isElementSelected ? [newSelection] : []),
        };
      }
      return {
        newEmailTemplateSelections: (!isElementSelected
            ? [...newEmailTemplateSelections, newSelection]
            : newEmailTemplateSelections.filter(selection => selection.email_template_id !== emailTemplateId)
          )
      };

    });
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
                <CollectionViewFilters
                  searchOptions={this.getSearchOptions()}
                  collectionItems={this.buildCollectionItems(emailTemplates)}
                  loading={isLoading}
                  pagination={pagination}
                />
                 : <EmptyTableView iconType="file" />}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

EmailTemplateSelector.defaultProps = {
  emailTemplateSelections: [],
  singleSelection: false,
};

EmailTemplateSelector.propTypes = {
  organisationId: PropTypes.string.isRequired,
  emailTemplateSelections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    email_template_id: PropTypes.string.isRequired,
  })),
  save: PropTypes.func.isRequired,
  singleSelection: PropTypes.bool,
  close: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
)(EmailTemplateSelector);
