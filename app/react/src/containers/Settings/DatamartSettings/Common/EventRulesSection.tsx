import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import cuid from 'cuid';
import { compose } from 'recompose';

import { injectDrawer } from '../../../../components/Drawer/index';
import { EventRuleFieldModel } from './domain';
import FormSection from '../../../../components/Form/FormSection';
import { RelatedRecords } from '@mediarithmics-private/mcs-components-library';
import RecordElement from '../../../../components/RelatedRecord/RecordElement';

import { ReduxFormChangeProps } from '../../../../utils/FormHelper';

import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';

import EventRulesForm, { EventRulesFormProps } from './EventRulesForm/EventRulesForm';
import { EventRuleUrlMatch } from '../../../../models/settings/settings';

export interface EventRulesSectionProps extends ReduxFormChangeProps {
  datamartId: string;
}

type Props = EventRulesSectionProps &
  WrappedFieldArrayProps<EventRuleFieldModel> &
  InjectedIntlProps &
  InjectedDrawerProps;

const messages = defineMessages({
  dropdownCatalogAutoMatch: {
    id: 'settings.form.eventRules.CatalogAutoMatch',
    defaultMessage: 'Catalog Auto Match',
  },
  dropdownUserIdentifierInsertion: {
    id: 'settings.form.eventRules.UserIdentifierInsertion',
    defaultMessage: 'User Identifier Insertion',
  },
  dropdownUrlMatch: {
    id: 'settings.form.eventRules.UrlMatch',
    defaultMessage: 'Url Match',
  },
  dropdownPropertyCopy: {
    id: 'settings.form.eventRules.PropertyCopy',
    defaultMessage: 'Property to Origin Copy',
  },
  sectionSubtitleEventRules: {
    id: 'settings.form.eventRules.subtitle',
    defaultMessage:
      'Add an Event Rule to your site so that you can run custom rules on any activity stored in your DMP.',
  },
  sectionTitleEventRule: {
    id: 'settings.form.eventRules.title',
    defaultMessage: 'Event Rules',
  },
  sectionEmptyEventRules: {
    id: 'settings.form.eventRules.empty',
    defaultMessage: 'There is no Event Rules created yet!',
  },
  sectionTitleCreateEventRule: {
    id: 'settings.form.eventRules.create',
    defaultMessage: 'Create Event Rules',
  },
  userIdInsertRecordTitle: {
    id: 'settings.form.eventRules.record.title.user-id-insert',
    defaultMessage:
      '{ruleType} - Property {propertyName} is hashed with {hashFunc} to be inserted as {identifierType} {optionnalCompartment}',
  },
  urlMatchRecordTitle: {
    id: 'settings.form.eventRules.record.title.url-match',
    defaultMessage: '{ruleType} - Matches {url}',
  },
  propToOrigCopyRecordTitle: {
    id: 'settings.form.eventRules.record.title.prop-to-orig-copy',
    defaultMessage: '{ruleType} - Property {propertyName} in {source} is copied to {dest}',
  },
  catalAutoMatchRecordTitle: {
    id: 'settings.form.eventRules.record.title.catal-auto-match',
    defaultMessage: '{ruleType} - {matchType}',
  },
});

class EventRulesSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  updateEventRules = (eventRule: EventRuleFieldModel) => {
    const { fields, formChange } = this.props;

    const formattedEventRule = eventRule;

    if (
      formattedEventRule.model.type === 'URL_MATCH' &&
      formattedEventRule.model.event_template &&
      formattedEventRule.model.event_template.$properties
    ) {
      formattedEventRule.model.event_template.$properties = formattedEventRule.model.event_template.$properties.reduce(
        (acc: { [key: string]: string }, cur: { leftValue: string; rightValue: string }) => {
          acc[cur.leftValue] = cur.rightValue;
          return acc;
        },
        {},
      );
    }

    const allFields = fields.getAll();
    if (formattedEventRule.key) {
      const changedFields = allFields.map(er =>
        er.key === formattedEventRule.key ? formattedEventRule : er,
      );
      formChange((fields as any).name, changedFields);
    } else {
      const newField: EventRuleFieldModel = {
        ...formattedEventRule,
        key: cuid(),
      };
      allFields.push(newField);
      formChange((fields as any).name, allFields);
    }

    this.props.closeNextDrawer();
  };

  openEventRulesSelector = (record: EventRuleFieldModel) => {
    let initialValues = record;

    if (
      record.model.type === 'URL_MATCH' &&
      record.model.event_template &&
      record.model.event_template.$properties
    ) {
      const formattedProperties = Object.keys(record.model.event_template.$properties).map(key => {
        return {
          leftValue: key,
          rightValue: (record.model as EventRuleUrlMatch).event_template.$properties[key],
        };
      });
      initialValues = {
        ...record,
        model: {
          ...record.model,
          event_template: {
            ...record.model.event_template,
            $properties: formattedProperties,
          },
        },
      };
    }

    const props: EventRulesFormProps = {
      close: this.props.closeNextDrawer,
      onSubmit: this.updateEventRules,
      breadCrumbPaths: ['Create Event Rule'],
      initialValues: initialValues,
      datamartId: this.props.datamartId,
    };

    this.props.openNextDrawer<EventRulesFormProps>(EventRulesForm, {
      additionalProps: props,
    });
  };

  openInitialEventRuleSelector = (
    type:
      | 'CATALOG_AUTO_MATCH'
      | 'PROPERTY_TO_ORIGIN_COPY'
      | 'USER_IDENTIFIER_INSERTION'
      | 'URL_MATCH',
  ) => () => {
    let initialValues = {};
    switch (type) {
      case 'CATALOG_AUTO_MATCH':
        initialValues = {
          model: { type: 'CATALOG_AUTO_MATCH', auto_match_type: 'CATEGORY' },
        };
        break;
      case 'PROPERTY_TO_ORIGIN_COPY':
        initialValues = {
          model: { type: 'PROPERTY_TO_ORIGIN_COPY', property_source: 'URL' },
        };
        break;
      case 'USER_IDENTIFIER_INSERTION':
        initialValues = {
          model: {
            type: 'USER_IDENTIFIER_INSERTION',
            hash_function: 'SHA_256',
            identifier_creation: 'USER_ACCOUNT',
          },
        };
        break;
      case 'URL_MATCH':
        initialValues = { model: { type: 'URL_MATCH' } };
        break;
    }

    const props: EventRulesFormProps = {
      close: this.props.closeNextDrawer,
      onSubmit: this.updateEventRules,
      breadCrumbPaths: [this.props.intl.formatMessage(messages.sectionTitleCreateEventRule)],
      initialValues: initialValues,
      datamartId: this.props.datamartId,
    };

    this.props.openNextDrawer<EventRulesFormProps>(EventRulesForm, {
      additionalProps: props,
    });
  };

  getEventRulesRecords = () => {
    const { fields } = this.props;

    const getRecordTitle = (field: EventRuleFieldModel) => {
      switch (field.model.type) {
        case 'CATALOG_AUTO_MATCH':
          return (
            <FormattedMessage
              {...messages.catalAutoMatchRecordTitle}
              values={{
                ruleType: field.model.type,
                matchType: <strong>{field.model.auto_match_type}</strong>,
              }}
            />
          );
        case 'PROPERTY_TO_ORIGIN_COPY':
          return (
            <FormattedMessage
              {...messages.propToOrigCopyRecordTitle}
              values={{
                ruleType: field.model.type,
                propertyName: <strong>{field.model.property_name}</strong>,
                source: <strong>{field.model.property_source}</strong>,
                dest: <strong>{field.model.destination}</strong>,
              }}
            />
          );
        case 'URL_MATCH':
          return (
            <FormattedMessage
              {...messages.urlMatchRecordTitle}
              values={{
                ruleType: field.model.type,
                url: <strong>{field.model.pattern}</strong>,
              }}
            />
          );
        case 'USER_IDENTIFIER_INSERTION':
          return (
            <FormattedMessage
              {...messages.userIdInsertRecordTitle}
              values={{
                ruleType: field.model.type,
                propertyName: <strong>{field.model.property_source}</strong>,
                hashFunc: <strong>{field.model.hash_function}</strong>,
                identifierType: field.model.identifier_creation,
                optionnalCompartment: field.model.compartment_id
                  ? `(comp: ${field.model.compartment_id})`
                  : '',
              }}
            />
          );
        default:
          return '';
      }
    };

    return fields.map((name, index) => {
      const removeField = () => fields.remove(index);

      const field = fields.get(index);

      return (
        <RecordElement
          key={field.key}
          recordIconType='optimization'
          record={field}
          title={getRecordTitle}
          onRemove={removeField}
          onEdit={this.openEventRulesSelector}
        />
      );
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownCatalogAutoMatch.id,
              message: messages.dropdownCatalogAutoMatch,
              onClick: this.openInitialEventRuleSelector('CATALOG_AUTO_MATCH'),
            },
            {
              id: messages.dropdownPropertyCopy.id,
              message: messages.dropdownPropertyCopy,
              onClick: this.openInitialEventRuleSelector('PROPERTY_TO_ORIGIN_COPY'),
            },
            {
              id: messages.dropdownUrlMatch.id,
              message: messages.dropdownUrlMatch,
              onClick: this.openInitialEventRuleSelector('URL_MATCH'),
            },
            {
              id: messages.dropdownUserIdentifierInsertion.id,
              message: messages.dropdownUserIdentifierInsertion,
              onClick: this.openInitialEventRuleSelector('USER_IDENTIFIER_INSERTION'),
            },
          ]}
          subtitle={messages.sectionSubtitleEventRules}
          title={messages.sectionTitleEventRule}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'optimization',
            message: formatMessage(messages.sectionEmptyEventRules),
          }}
        >
          {this.getEventRulesRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<EventRulesSectionProps, Props>(injectIntl, injectDrawer)(EventRulesSection);
