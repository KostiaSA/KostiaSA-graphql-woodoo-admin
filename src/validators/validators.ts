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
            message: t("api-префикс не может быть пустым")
        },
        {
            validator: async (rule: Rule, value: string) => {
                if (!GraphQL_indentifier_regexp.test(value))
                    throw new Error(t("bad identifier"));
            },
        },
        {
            max: 63,
            message: t("длина api-префикса не может быть более 63 символов")
        },

    ]
}

export function getDatabaseApiPrefixRules(): Rule[] {
    return [
        {
            required: true,
            message: t("api-префикс не может быть пустым")
        },
        {
            validator: async (rule: Rule, value: string) => {
                if (!GraphQL_indentifier_regexp.test(value))
                    throw new Error(t("<bad identifier>", { id_name: t("api-префикс") }));
            },
        },
        {
            max: 63,
            message: "длина api-префикса не может быть более 63 символов"
        },

    ]
}

export function getSchemaTableColumnNameRules(): Rule[] {
    return [
        {
            required: true,
            message: "'имя колонки' не может быть пустым"
        },
        {
            validator: async (rule: Rule, value: string): Promise<any> => {
                if (!(GraphQL_indentifier_regexp.test(value))) {
                    throw new Error("'имя колонки' может содержать только латин. буквы, цифры, _ и начинаться с буквы или _");
                }
            },
        },
        {
            max: 63,
            message: "длина 'имени колонки' не может быть более 63 символов"
        },

    ]
}