export type DimensionFilterOperator = "EXACT"
                                      | "NUMERIC_EQUAL"
                                      | "NUMERIC_GREATER_THAN"
                                      | "NUMERIC_LESS_THAN"
                                      | "IN_LIST"
                                      | "IS_NULL";


export const dimensionFilterOperator: DimensionFilterOperator[] = [
                                        "EXACT",
                                        "NUMERIC_EQUAL",
                                        "NUMERIC_GREATER_THAN",
                                        "NUMERIC_LESS_THAN",
                                        "IN_LIST",
                                        "IS_NULL"
                                      ]

export type BooleanOperator = "OR" | "AND";

                                      
export const booleanOperator: BooleanOperator[] = ["OR", "AND"]