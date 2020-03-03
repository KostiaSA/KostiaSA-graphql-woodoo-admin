import { Rule } from 'rc-field-form/lib/interface';
import i18next from 'i18next';
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

export function getDatabaseApiNameRules(): Rule[] {
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

