import React, { Fragment } from 'react'

import { Filter, FilterFelt } from './Filter'

const erObjekt = (verdi: unknown): verdi is Record<string, unknown> =>
    typeof verdi === 'object' && verdi !== null && !Array.isArray(verdi)

const erBladverdi = (verdi: unknown): boolean => !Array.isArray(verdi) && !erObjekt(verdi)

const formaterVerdi = (verdi: unknown): string => {
    if (typeof verdi === 'string') return verdi
    if (verdi === null) return 'null'
    if (verdi === undefined) return 'undefined'
    return String(verdi)
}

const renderVerdi = (
    verdi: unknown,
    filter: Filter[],
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>,
    sti: string,
    erRot = false,
): React.ReactNode => {
    if (Array.isArray(verdi)) {
        if (verdi.length === 0) return '[]'

        return (
            <ul className="ml-4 list-disc">
                {verdi.map((element, indeks) => {
                    const elementSti = `${sti}[${indeks}]`

                    if (erBladverdi(element)) {
                        return (
                            <li key={elementSti}>
                                <span className="inline-flex items-start gap-1">
                                    <FilterFelt
                                        prop={elementSti}
                                        verdi={element}
                                        filter={filter}
                                        setFilter={setFilter}
                                    />
                                    <span>{formaterVerdi(element)}</span>
                                </span>
                            </li>
                        )
                    }

                    return <li key={elementSti}>{renderVerdi(element, filter, setFilter, elementSti)}</li>
                })}
            </ul>
        )
    }

    if (erObjekt(verdi)) {
        const nøkler = Object.entries(verdi)
        if (nøkler.length === 0) return '{}'

        return (
            <div className={erRot ? '' : 'ml-3'}>
                {nøkler.map(([nøkkel, nestetVerdi]) => {
                    const nestetSti = sti ? `${sti}.${nøkkel}` : nøkkel
                    const bladverdi = erBladverdi(nestetVerdi)

                    return (
                        <div key={nestetSti} className="flex items-start gap-1">
                            {bladverdi && (
                                <FilterFelt
                                    prop={nestetSti}
                                    verdi={nestetVerdi}
                                    filter={filter}
                                    setFilter={setFilter}
                                />
                            )}
                            <span className="font-semibold">{nøkkel}:</span>
                            {renderVerdi(nestetVerdi, filter, setFilter, nestetSti)}
                        </div>
                    )
                })}
            </div>
        )
    }

    return <span>{formaterVerdi(verdi)}</span>
}

export const Detaljer = ({
    objekt,
    filter,
    setFilter,
}: {
    objekt: object
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) => <Fragment>{renderVerdi(objekt, filter, setFilter, '', true)}</Fragment>
