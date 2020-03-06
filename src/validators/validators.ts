import { Rule } from 'rc-field-form/lib/interface';
import i18next from 'i18next';
import { gql } from '@apollo/client';
import { apolloExecute } from '../apolloClient';
const t = i18next.t.bind(i18next);
/*
interface BaseRule {
    enum?: StoreValue[];
    len?: number;
    max?: number;
    message?: string | ReactElement;
    min?: number;
    pattern?: RegExp;
    required?: boolean;
    transform?: (value: StoreValue) => StoreValue;
    type?: RuleType;
    validator?: Validator;
    whitespace?: boolean;
     //Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` 
    validateTrigger ?: string | string[];
}
*/

export const GraphQL_indentifier_regexp = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

export function getDatabaseApiNameRules(addMode: boolean): Rule[] {
    return [
        {
            required: true,
            message: t("cannot_be_empty", { name: t("api_name") })
        },
        // {
        //     validator: async (rule: Rule, value: string) => {
        //         if (!GraphQL_indentifier_regexp.test(value))
        //             throw new Error(t("bad_identifier", { name: t("api_name") }));
        //     },
        // },
        {
            max: 63,
            message: t("max_length_exceeded", { name: t("api_name"), length: 63 })
        },
        {
            validator: async (rule: any, value: string) => {
                if (addMode) {
                    let query = gql`query($db_name:String) {database_exists(db_name:$db_name)}`;
                    let res = await apolloExecute(query, { db_name: value });
                    if (res.database_exists)
                        throw new Error(t("db_already_exists", { name: value }));
                }
            }
        }

    ]
}

export function getDatabaseApiPrefixRules(): Rule[] {
    return [
        {
            required: true,
            message: t("cannot_be_empty", { name: t("api_prefix") })
        },
        {
            validator: async (rule: Rule, value: string) => {
                if (!GraphQL_indentifier_regexp.test(value))
                    throw new Error(t("bad_identifier", { name: t("api_prefix") }));
            },
        },
        {
            max: 63,
            message: t("max_length_exceeded", { name: t("api_prefix"), length: 63 })
        },

    ]
}

