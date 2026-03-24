import React, { Fragment } from 'react'

import { Filter, FilterFelt } from './Filter'

const erObjekt = (verdi: unknown): verdi is Record<string, unknown> =>
    typeof verdi === 'object' && verdi !== null && !Array.isArray(verdi)

const renderVerdi = (verdi: unknown): React.ReactNode => {
    if (Array.isArray(verdi)) {
        if (verdi.length === 0) return '[]'

        return (
            <ul className="ml-6 list-disc">
                {verdi.map((element, indeks) => (
                    <li key={indeks}>{renderVerdi(element)}</li>
                ))}
            </ul>
        )
    }

    if (erObjekt(verdi)) {
        const nøkler = Object.entries(verdi)
        if (nøkler.length === 0) return '{}'

        return (
            <div className="ml-4">
                {nøkler.map(([nøkkel, nestetVerdi]) => (
                    <div key={nøkkel}>
                        <span className="font-semibold">{nøkkel}:</span> {renderVerdi(nestetVerdi)}
                    </div>
                ))}
            </div>
        )
    }

    if (typeof verdi === 'string') return verdi
    if (verdi === null) return 'null'

    return String(verdi)
}

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
        {Object.entries(objekt).map(([nøkkel, verdi], indeks) => (
            <div key={nøkkel + indeks}>
                <FilterFelt prop={nøkkel} verdi={verdi} filter={filter} setFilter={setFilter} />
                <span className="font-semibold"> {nøkkel}:</span> {renderVerdi(verdi)}
            </div>
        ))}
    </Fragment>
)
