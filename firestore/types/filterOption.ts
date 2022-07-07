import { WhereFilterOp } from "firebase-admin/firestore";

export enum expression {
    LESS_THAN = "<",
    LESS_THAN_EQUAL = "<=",
    GREATER_THAN = ">",
    GREATER_THAN_EQUAL = ">=",
    EQUAL_TO = "==",
    NOT_EQUAL_TO = "!=",
    ARRAY_CONTAINS = "array-contains",
    ARRAY_CONTAINS_ANY = "array-contains-any",
    IN = "in",
    NOT_IN = "not-in",
}

export type filter_option = {
    field: string;
    expression: WhereFilterOp;
    value: any;
};
