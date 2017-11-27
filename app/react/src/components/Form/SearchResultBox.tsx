import * as React from 'react';
import { Row } from 'antd';
import { ButtonStyleless, McsIcons } from '../../components';
import { WrappedFieldArrayProps } from 'redux-form';

interface SearchResultBoxProps {
    formInputSearchProps: Array<{
        countryName: string;
        excludeOrInclude: string;
    }>;
    tableName: string;
    loading: boolean;
    updateTableFields: (a: {newField: any, tableName: string}) => void;
}

class SearchResultBox extends React.Component<
  SearchResultBoxProps & WrappedFieldArrayProps<{country: string, exclude: boolean, toBeRemoved: boolean }>> {

    deleteLocationFromFields = (index: number, allFields: any) => () => {
        const newField = {
            ...allFields.get(index),
            toBeRemoved: true,
        };
        const a =  allFields.getAll();
        allFields.removeAll();
        a[index] = newField;
        a.map((b: any, ind: any) => {
            return allFields.insert(ind, b);
        });
        allFields.insert(index, newField);
    }

    render() {

        const {
            fields,
        } = this.props;

        return (
            <div>
                <Row
                    type="flex"
                    align="middle"
                    justify="space-between"
                    className={fields.length !== 0 ? 'search-result-box' : 'hide-section'}
                >
                    {fields ? fields.map((name, index, allFields) => {

                        return allFields.get(index).toBeRemoved ? null : (
                            <div className={'search-result-box-item'} key={index}>

                                {(allFields.get(index).exclude) ?
                                    <McsIcons type="close-big" />
                                : <McsIcons type="check" />}
                                {allFields.get(index).country}

                                <ButtonStyleless
                                    className="close-button"
                                    onClick={this.deleteLocationFromFields(index, allFields)}
                                >
                                    <McsIcons type="close" />
                                </ButtonStyleless>
                            </div>
                        );
                    }) : null}
                </Row>
            </div>
          );
    }
}

export default SearchResultBox;
