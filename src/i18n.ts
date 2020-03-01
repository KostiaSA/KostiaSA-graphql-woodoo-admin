import i18n from "i18next";
import { initReactI18next } from "react-i18next";


export const i18_langs = ["ru", "en"];
// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: {
            // DatabasesListPage
            "Базы данных": "Databases",
            "Список баз данных для API": "API databases list",
            "api-имя": "api name",
            "api-префикс": "api prefix",
            "описание": "description",
            "тип сервера": "server type",
            "адрес сервера (URL)": "server host",
            "имя базы данных": "database name",
            "логин": "login",
            "действия": "actions",
            "удал.": "delete",
            "изм.": "edit",
            "+ добавить базу даных": "+ add new database",

        }
    }
};

/*
                <Column title={t("api-имя")} dataIndex="name" key="name" className="database-text-color" />
                <Column title={t("api-префикс")} dataIndex="prefix" key="prefix" className="database-text-color" />
                <Column title={t("описание")} dataIndex="description" key="description" className="database-text-color" /> }
                <Column title={t("тип сервера")} dataIndex="type" key="package.name" />
                <Column
                    title={t("адрес сервера (URL)")}
                key="connection.host"
                    render={(text, record: IDatabase, index) => <span>{record.connection.host}:{record.connection.port}</span>}
                />
                <Column title={t("имя базы данных")} dataIndex={["connection", "database"]} key="connection.database" />
                <Column title={t("логин")} dataIndex={["connection", "username"]} key="connection.username" />
                <Column title={<span style={{ float: "right" }}>{t("действия"}</span>} key="operation"

*/

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        //lng: "en",
        lng: "ru",

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;

