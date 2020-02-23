import React, { useState } from "react";
import { gql, useQuery } from '@apollo/client';
import { IDatabase } from "../../voodoo-shared/ISchema";

const GET_DOGS = gql`
  {
     databases
  }
`;

export function Example(p: { str: string }) {
    // Объявление переменной состояния, которую мы назовём "count"
    const [count, setCount] = useState<number>(0);
    const [count2, setCount2] = useState<number>(110);

    const { loading, error, data } = useQuery<{ databases: IDatabase[] }>(GET_DOGS);

    if (loading) return <div>'Loading...'</div>;
    if (error) return <div>`Error! ${error.message}`</div>;

    return (
        <div>
            <p>{p.str}Вы кликнули {count} раз {data?.databases[0].name}</p>
            <button onClick={() => setCount(count + 1)}> Нажми на меня</button>
            <p>Вы кликнули {count2} раз 2</p>
            <button onClick={() => setCount2(count2 + 2)}> Нажми на меня 2</button>
        </div>
    );
}