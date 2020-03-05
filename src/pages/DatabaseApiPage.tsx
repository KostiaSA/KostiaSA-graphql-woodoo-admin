import * as React from "react";
import { useTranslation } from "react-i18next";
import { useObserver } from "mobx-react-lite";
import { useParams } from "react-router-dom";

export function DatabaseApiPage() {
    const { t, i18n } = useTranslation();

    let { db_name } = useParams();
    console.log(useParams())



    return useObserver(() => {

        return (
            <div>ага {db_name}</div>
        );
    });
}