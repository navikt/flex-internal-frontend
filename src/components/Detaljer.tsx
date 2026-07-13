import React, { Fragment } from 'react'
import dayjs, { Dayjs } from 'dayjs'

import { Filter, FilterFelt } from './Filter'

const erObjekt = (verdi: unknown): verdi is Record<string, unknown> =>
    typeof verdi === 'object' && verdi !== null && !Array.isArray(verdi)

const erDayjsObjekt = (verdi: unknown): verdi is Dayjs => dayjs.isDayjs(verdi)

const erDatostreng = (verdi: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(verdi)) {
        return false
    }
    return dayjs(verdi).isValid()
}

const harTidspunkt = (verdi: string): boolean => /[T ]\d{2}:\d{2}/.test(verdi)

const erTom = (verdi: unknown): boolean =>
    (Array.isArray(verdi) && verdi.length === 0) || (erObjekt(verdi) && Object.keys(verdi).length === 0)

const erBladverdi = (verdi: unknown): boolean =>
    erDayjsObjekt(verdi) || (!Array.isArray(verdi) && !erObjekt(verdi)) || erTom(verdi)

const formaterVerdi = (verdi: unknown): string => {
    if (erDayjsObjekt(verdi)) return verdi.format('D MMM YYYY HH:mm')
    if (typeof verdi === 'string') {
        if (erDatostreng(verdi)) {
            const dato = dayjs(verdi)
            return dato.format(harTidspunkt(verdi) ? 'D MMM YYYY HH:mm' : 'D MMM YYYY')
        }
        return verdi
    }
    if (verdi === null) return 'null'
    if (verdi === undefined) return 'undefined'
    return String(verdi)
}

const renderVerdi = (
    verdi: unknown,
    filter: Filter[],
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>,
    sti: string,
): React.ReactNode => {
    if (erBladverdi(verdi)) {
        return <span>{formaterVerdi(verdi)}</span>
    }

    if (Array.isArray(verdi)) {
        if (verdi.length === 0) return '[]'

        return (
            <ul className="ml-3 list-none">
                {verdi.map((element, indeks) => {
                    const elementSti = `${sti}[${indeks}]`

                    if (erBladverdi(element)) {
                        return (
                            <li key={elementSti} className="mt-0.5">
                                <FilterFelt
                                    prop={elementSti}
                                    verdi={element}
                                    filter={filter}
                                    setFilter={setFilter}
                                    markerHeleRad
                                    barn={<span>{formaterVerdi(element)}</span>}
                                />
                            </li>
                        )
                    }

                    return (
                        <li key={elementSti} className="mt-0.5">
                            {renderVerdi(element, filter, setFilter, elementSti)}
                        </li>
                    )
                })}
            </ul>
        )
    }

    if (erObjekt(verdi)) {
        const nøkler = Object.entries(verdi)
        if (nøkler.length === 0) return '{}'

        return (
            <div className="ml-3">
                {nøkler.map(([nøkkel, nestetVerdi]) => {
                    const nestetSti = sti ? `${sti}.${nøkkel}` : nøkkel
                    const bladverdi = erBladverdi(nestetVerdi)

                    return (
                        <div key={nestetSti} className="mt-0.5">
                            {bladverdi ? (
                                <FilterFelt
                                    prop={nestetSti}
                                    verdi={nestetVerdi}
                                    filter={filter}
                                    setFilter={setFilter}
                                    markerHeleRad
                                    barn={
                                        <>
                                            <span className="font-semibold">{nøkkel}:</span>{' '}
                                            {renderVerdi(nestetVerdi, filter, setFilter, nestetSti)}
                                        </>
                                    }
                                />
                            ) : (
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">{nøkkel}:</span>
                                </div>
                            )}
                            {!bladverdi && renderVerdi(nestetVerdi, filter, setFilter, nestetSti)}
                        </div>
                    )
                })}
            </div>
        )
    }

    return <span>{formaterVerdi(verdi)}</span>
}

const renderRotnivå = (
    objekt: object,
    filter: Filter[],
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>,
): React.ReactNode => {
    const nøkler = Object.entries(objekt)
    return (
        <div className="divide-y divide-gray-100">
            {nøkler.map(([nøkkel, verdi]) => {
                const sti = nøkkel
                const bladverdi = erBladverdi(verdi)

                return (
                    <div key={nøkkel} className="py-0.5">
                        <div className="flex min-w-0 items-baseline gap-1.5 text-ax-medium">
                            <span className="shrink-0 font-semibold text-gray-500">{nøkkel}:</span>
                            {bladverdi && (
                                <FilterFelt
                                    prop={sti}
                                    verdi={verdi}
                                    filter={filter}
                                    setFilter={setFilter}
                                    markerHeleRad
                                    barn={<span className="text-gray-900">{formaterVerdi(verdi)}</span>}
                                />
                            )}
                        </div>
                        {!bladverdi && (
                            <div className="text-sm text-gray-900">{renderVerdi(verdi, filter, setFilter, sti)}</div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export const Detaljer = ({
    objekt,
    filter,
    setFilter,
}: {
    objekt: object
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) => <Fragment>{renderRotnivå(objekt, filter, setFilter)}</Fragment>
