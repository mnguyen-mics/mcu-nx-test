import * as React from 'react';
import CustomPropertyRenderer from './CustomPropertyRenderer';
import { Tooltip, Tag } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps, defineMessages } from 'react-intl';
import {
  TemplateDefinitions,
  ExtendedTemplates,
  ExpandAllStatus,
} from './CustomObjectRendererWrapper';
import { AnyJson } from '../models/datamart/UserActivityResource';

const messages = defineMessages({
  viewMore: {
    id: 'components.customObjectRenderer.viewMore',
    defaultMessage: 'View more...',
  },
  viewLess: {
    id: 'components.customObjectRenderer.viewLess',
    defaultMessage: 'View less',
  },
});

interface CustomObjectRendererProps {
  objectToBeRendered: AnyJson;
  customRenderingTemplates: ExtendedTemplates;
  leftBorder: boolean;
  expandAllStatus: ExpandAllStatus;
  authorizeExpandAll: () => void;
}

type Props = CustomObjectRendererProps & InjectedIntlProps;

type ViewMoreStatus = 'INIT_OR_NOT_NEEDED' | 'VIEW_MORE' | 'VIEW_LESS';

interface State {
  viewMoreStatus: ViewMoreStatus;
}

class CustomObjectRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      viewMoreStatus: 'INIT_OR_NOT_NEEDED',
    };
  }

  // formatObject transforms an object to an array
  // of key and value tuples. It also eliminates properties
  // of the object with a null value.
  formatObject = (object: AnyJson): Array<[string, AnyJson]> => {
    if (object !== null && typeof object === 'object') {
      return Object.entries(object).filter((keyAndValue: [string, AnyJson]) => {
        const value = keyAndValue[1];
        return value !== null;
      });
    }
    return [];
  };

  // Used to apply a custom template to display the value
  getApplyTemplateOpt = (key: string, value: AnyJson) => (
    layer: TemplateDefinitions,
  ): JSX.Element | null => {
    // If a template exists for the key, in the layer
    if (key in layer) {
      // The template is applied to the value
      const returnedValue = layer[key](value);
      return <CustomPropertyRenderer name={key} value={returnedValue} />;
    }
    return null;
  };

  // Function used to create extended templates from other extended templates, relatively (using key)
  createRecLocalTemplates = (localTemplates: ExtendedTemplates, key: string): ExtendedTemplates => {
    const recTemplates: ExtendedTemplates = {
      absoluteTemplates: {},
      transformedTemplates: {},
      relativeTemplates: localTemplates.relativeTemplates,
    };

    const transformLayer = (inLayer: TemplateDefinitions, outLayer: TemplateDefinitions) => {
      Object.entries(inLayer).forEach(
        (entry: [string, (value: AnyJson) => AnyJson | JSX.Element]) => {
          const completeVarName = entry[0];
          const researchedBeginning = key + '.';
          const associatedFunction = entry[1];

          if (completeVarName.startsWith(researchedBeginning)) {
            const end = completeVarName.substr(researchedBeginning.length);
            outLayer[end] = associatedFunction;
          }
        },
      );
    };

    transformLayer(localTemplates.absoluteTemplates, recTemplates.absoluteTemplates);
    transformLayer(localTemplates.transformedTemplates, recTemplates.transformedTemplates);
    transformLayer(localTemplates.relativeTemplates, recTemplates.transformedTemplates);

    return recTemplates;
  };

  // Used to add a left border to the object
  createDisplayedObject = (
    leftBorder: boolean,
    valueToBeDisplayed: AnyJson | JSX.Element,
  ): JSX.Element => {
    return leftBorder ? (
      <div className='left-border-object'>{valueToBeDisplayed}</div>
    ) : (
      <span className='object'>{valueToBeDisplayed}</span>
    );
  };

  // Same as createDisplayedObject, but with a CustomPropertyRenderer as value
  createDisplayedObjectWithProperty = (leftBorder: boolean, value: AnyJson): JSX.Element => {
    const valueToBeDisplayed = <CustomPropertyRenderer value={value} />;
    return this.createDisplayedObject(leftBorder, valueToBeDisplayed);
  };

  // Used to adapt the data to View more, View less, Expand all, Collapse all,
  // if needed
  reduceListAndGetViewMore = (
    value: AnyJson[],
  ): { listToBeRendered: AnyJson[]; viewMoreButton?: JSX.Element } => {
    const { expandAllStatus, authorizeExpandAll } = this.props;
    const { viewMoreStatus } = this.state;
    const nbMaxItems = 5;

    const invertViewMoreStatus = () => {
      if (viewMoreStatus === 'VIEW_MORE') {
        this.setState({ viewMoreStatus: 'VIEW_LESS' });
      } else if (viewMoreStatus === 'VIEW_LESS') {
        this.setState({ viewMoreStatus: 'VIEW_MORE' });
      }
    };

    const viewMoreButton = (plus: boolean) => {
      const message = plus ? messages.viewMore : messages.viewLess;
      return (
        <button className='button-sm' onClick={invertViewMoreStatus}>
          <FormattedMessage {...message} />
        </button>
      );
    };

    switch (expandAllStatus) {
      case 'INIT_OR_NOT_NEEDED':
      case 'EXPAND_ALL':
        switch (viewMoreStatus) {
          case 'INIT_OR_NOT_NEEDED':
            if (value.length > nbMaxItems) {
              authorizeExpandAll();
              this.setState({ viewMoreStatus: 'VIEW_MORE' });
              return {
                listToBeRendered: value.slice(0, nbMaxItems),
                viewMoreButton: viewMoreButton(true),
              };
            }
            return { listToBeRendered: value };
          case 'VIEW_MORE':
            return {
              listToBeRendered: value.slice(0, nbMaxItems),
              viewMoreButton: viewMoreButton(true),
            };
          case 'VIEW_LESS':
            return {
              listToBeRendered: value,
              viewMoreButton: viewMoreButton(false),
            };
        }
        break;
      case 'COLLAPSE_ALL':
        if (viewMoreStatus !== 'INIT_OR_NOT_NEEDED') {
          this.setState({ viewMoreStatus: 'INIT_OR_NOT_NEEDED' });
        }
        return { listToBeRendered: value };
    }
    return { listToBeRendered: [] };
  };

  renderAux = (): JSX.Element => {
    const {
      objectToBeRendered,
      customRenderingTemplates,
      leftBorder,
      expandAllStatus,
      authorizeExpandAll,
    } = this.props;

    const {
      absoluteTemplates: absoluteLayer,
      transformedTemplates: transformedLayer,
      relativeTemplates: relativeLayer,
    } = customRenderingTemplates;

    // Simple cases first: boolean, string, number

    switch (typeof objectToBeRendered) {
      case 'boolean':
        return this.createDisplayedObjectWithProperty(
          leftBorder,
          objectToBeRendered ? 'True' : 'False',
        );
      case 'string':
      case 'number':
        return this.createDisplayedObjectWithProperty(leftBorder, objectToBeRendered);
    }

    // First complex case : Array

    if (Array.isArray(objectToBeRendered)) {
      const {
        listToBeRendered,
        viewMoreButton: viewMoreButtonForList,
      } = this.reduceListAndGetViewMore(objectToBeRendered);

      const renderedElements: JSX.Element | JSX.Element[] =
        listToBeRendered.length !== 0
          ? listToBeRendered.map((element: AnyJson, index: number) => {
              return (
                <CustomObjectRenderer
                  key={index}
                  objectToBeRendered={element}
                  customRenderingTemplates={customRenderingTemplates}
                  leftBorder={true}
                  intl={this.props.intl}
                  expandAllStatus={expandAllStatus}
                  authorizeExpandAll={authorizeExpandAll}
                />
              );
            })
          : // Empty list case
            this.createDisplayedObject(
              leftBorder,
              <span className='EmptyListPropertyValue'>
                <Tooltip title='Empty list'>
                  <Tag className='card-tag'>[]</Tag>
                </Tooltip>
              </span>,
            );
      return (
        <span className='PropertyList'>
          {renderedElements}
          {viewMoreButtonForList && this.createDisplayedObject(true, viewMoreButtonForList)}
        </span>
      );
    }

    // Second complex case : objects

    // Null properties of the object are eliminated
    // There is no need to display them.
    const nonNullPropertiesOfTheObject = this.formatObject(objectToBeRendered);

    // Empty object treated first
    if (nonNullPropertiesOfTheObject.length === 0) {
      return this.createDisplayedObject(
        leftBorder,
        <span className='EmptyObjectPropertyValue'>
          <Tooltip title='Empty object'>
            <Tag className='card-tag'>{'{}'}</Tag>
          </Tooltip>
        </span>,
      );
    }

    const {
      listToBeRendered: transformedProperties,
      viewMoreButton: viewMoreButtonObject,
    } = this.reduceListAndGetViewMore(nonNullPropertiesOfTheObject);

    //
    // Map to render each property of the object
    //
    const keysAndValuesToBeDisplayed: JSX.Element[] = transformedProperties.map(
      (keyAndValue: [string, AnyJson]): JSX.Element => {
        const key = keyAndValue[0];
        const value = keyAndValue[1];

        // To be used three times underneath
        const applyTemplateOpt = this.getApplyTemplateOpt(key, value);

        // The first three cases depend on the key, when a custom rendering is asked :
        // 1) with an absolute property name;
        // 2) with a relative property name (transformed into an absolute one in a context);
        // 3) with a relative property name.
        const customJSX: JSX.Element | null =
          applyTemplateOpt(absoluteLayer) ||
          applyTemplateOpt(transformedLayer) ||
          applyTemplateOpt(relativeLayer);
        if (customJSX !== null) {
          return customJSX;
        }

        // If no custom rendering is asked, recursive treatment

        const recTemplates: ExtendedTemplates = this.createRecLocalTemplates(
          customRenderingTemplates,
          key,
        );

        const isBaseCase =
          typeof value === 'boolean' ||
          typeof value === 'string' ||
          typeof value === 'number' ||
          (Array.isArray(value) && value.length === 0) || // No need of a new line for []
          (value !== null &&
            typeof value === 'object' &&
            Array.isArray(value) === false &&
            Object.keys(value).length === 0); // No need of a new line for {}

        const renderedValue = (
          <CustomObjectRenderer
            objectToBeRendered={value}
            customRenderingTemplates={recTemplates}
            leftBorder={!isBaseCase}
            intl={this.props.intl}
            expandAllStatus={expandAllStatus}
            authorizeExpandAll={authorizeExpandAll}
          />
        );

        return (
          <CustomPropertyRenderer
            key={key}
            name={key}
            value={renderedValue}
            nameNewLineValue={!isBaseCase}
          />
        );
      },
    );

    const keysWithButton = (
      <span>
        {keysAndValuesToBeDisplayed}
        {viewMoreButtonObject}
      </span>
    );

    return this.createDisplayedObject(leftBorder, keysWithButton);
  };

  render() {
    return <span>{this.renderAux()}</span>;
  }
}

export default injectIntl(CustomObjectRenderer);
