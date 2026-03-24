import React, { Fragment } from 'react'

import { Filter, FilterFelt } from './Filter'

export const Detaljer = ({
    objekt,
    filter,
    setFilter,
}: {
    objekt: object
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) => (
    <Fragment>
        {Object.entries(objekt).map(([key, val], idx) => (
            <div key={key + idx}>
                <FilterFelt prop={key} verdi={val} filter={filter} setFilter={setFilter} />
                {` ${key}: ${JSON.stringify(val)}`}
            </div>
        ))}
    </Fragment>
)
