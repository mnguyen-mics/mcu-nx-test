import * as React from 'react';
import CustomPropertyRenderer from './CustomPropertyRenderer';
import { Tooltip, Tag } from 'antd';

export interface TemplateDefinitions {
  [varName: string]: (value: any) => any;
}

export interface RenderingTemplates {
  absoluteTemplates: TemplateDefinitions;
  relativeTemplates: TemplateDefinitions;
}

interface ExtendedTemplates extends RenderingTemplates {
  transformedTemplates: TemplateDefinitions;
}

interface CustomObjectRendererProps {
  customObject: any;
  customRenderingTemplates: RenderingTemplates;
}

class CustomObjectRenderer extends React.Component<CustomObjectRendererProps> {
  // formatObject transforms an object to an array
  // of key, value tuples. It also eliminates properties
  // of the object with a null value.
  formatObject = (object: any): Array<[string, any]> => {
    return Object.entries(object).filter((keyAndValue: [string, any]) => {
      const value = keyAndValue[1];
      return value !== null;
    });
  };

  getApplyTemplateOpt = (key: string, value: any) => (
    layer: TemplateDefinitions,
  ): JSX.Element | undefined => {
    // If a template exists for the key, in the layer
    if (key in layer) {
      // The template is applied to the value
      const returnedValue = layer[key](value);
      return <CustomPropertyRenderer name={key} value={returnedValue} />;
    }
    return undefined;
  };

  // Function used to create extended templates from other extended templates, relatively
  createRecLocalTemplates = (
    localTemplates: ExtendedTemplates,
    key: string,
  ): ExtendedTemplates => {
    const recTemplates: ExtendedTemplates = {
      absoluteTemplates: {},
      transformedTemplates: {},
      relativeTemplates: localTemplates.relativeTemplates,
    };

    const transformLayer = (
      inLayer: TemplateDefinitions,
      outLayer: TemplateDefinitions,
    ) => {
      Object.entries(inLayer).forEach(
        (entry: [string, (value: any) => any]) => {
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

    transformLayer(
      localTemplates.absoluteTemplates,
      recTemplates.absoluteTemplates,
    );
    transformLayer(
      localTemplates.transformedTemplates,
      recTemplates.transformedTemplates,
    );
    transformLayer(
      localTemplates.relativeTemplates,
      recTemplates.transformedTemplates,
    );

    return recTemplates;
  };

  // Used to add a left border to the object
  createDisplayedObject = (leftBorder: boolean, valueToBeDisplayed: any) => {
    return leftBorder ? (
      <div className="left-border-object">{valueToBeDisplayed}</div>
    ) : (
      <span className="object">{valueToBeDisplayed}</span>
    );
  };

  // Same as createDisplayedObject, but with a CustomPropertyRenderer as value
  createDisplayedObjectWithProperty = (leftBorder: boolean, value: any) => {
    const valueToBeDisplayed = <CustomPropertyRenderer value={value} />;
    return this.createDisplayedObject(leftBorder, valueToBeDisplayed);
  };

  // Recursive function used to render an object
  recRenderFunction = (
    objectToBeRendered: any,
    localTemplates: ExtendedTemplates,
    leftBorder: boolean,
  ): JSX.Element => {
    const {
      absoluteTemplates: absoluteLayer,
      transformedTemplates: transformedLayer,
      relativeTemplates: relativeLayer,
    } = localTemplates;

    // Simple cases first: boolean, string, number

    switch (typeof objectToBeRendered) {
      case 'boolean':
        return this.createDisplayedObjectWithProperty(
          leftBorder,
          objectToBeRendered ? 'True' : 'False',
        );
      case 'string':
      case 'number':
        return this.createDisplayedObjectWithProperty(
          leftBorder,
          objectToBeRendered,
        );
    }

    // First complex case : Array

    if (Array.isArray(objectToBeRendered)) {
      const renderedElements =
        objectToBeRendered.length !== 0
          ? objectToBeRendered.map((element: any) => {
              return this.recRenderFunction(element, localTemplates, true);
            })
          : // Empty list case
            this.createDisplayedObject(
              leftBorder,
              <Tooltip title="Empty list">
                <Tag className="card-tag">[]</Tag>
              </Tooltip>,
            );
      return <span>{renderedElements}</span>;
    }

    // Second complex case : objects

    // Null properties of the object are eliminated
    // There is no need to display them.
    const nonNullPropertiesOfTheObject = this.formatObject(objectToBeRendered);

    // Empty object treated first
    if (nonNullPropertiesOfTheObject.length === 0) {
      return this.createDisplayedObject(
        leftBorder,
        <Tooltip title="Empty object">
          <Tag className="card-tag">{'{}'}</Tag>
        </Tooltip>,
      );
    }

    //
    // Map to render each property of the object
    //
    const keysAndValuesToBeDisplayed: JSX.Element[] = nonNullPropertiesOfTheObject.map(
      (keyAndValue: [string, any]): JSX.Element => {
        const key = keyAndValue[0];
        const value = keyAndValue[1];

        // To be used three times underneath
        const applyTemplateOpt = this.getApplyTemplateOpt(key, value);

        // The first three cases depend on the key, when a custom rendering is asked :
        // 1) with an absolute property name;
        // 2) with a relative property name (transformed into an absolute one in a context);
        // 3) with a relative property name.
        const customJSX =
          applyTemplateOpt(absoluteLayer) ||
          applyTemplateOpt(transformedLayer) ||
          applyTemplateOpt(relativeLayer);
        if (customJSX) {
          return customJSX;
        }

        // If no custom rendering is asked, recursive treatment

        const recTemplates: ExtendedTemplates = this.createRecLocalTemplates(
          localTemplates,
          key,
        );

        const isBaseCase =
          typeof value === 'boolean' ||
          typeof value === 'string' ||
          typeof value === 'number' ||
          (Array.isArray(value) && value.length === 0) || // No need of a new line for []
          Object.keys(value).length === 0; // No need of a new line for {}

        const renderedValue = this.recRenderFunction(
          value,
          recTemplates,
          !isBaseCase,
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

    return this.createDisplayedObject(leftBorder, keysAndValuesToBeDisplayed);
  };

  render() {
    const { customObject, customRenderingTemplates } = this.props;
    const extendedCustomRenderings: ExtendedTemplates = {
      transformedTemplates: {},
      ...customRenderingTemplates,
    };
    return (
      <div className="custom-object-renderer">
        {this.recRenderFunction(customObject, extendedCustomRenderings, false)}
      </div>
    );
  }
}

export default CustomObjectRenderer;
