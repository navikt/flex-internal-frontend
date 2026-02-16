import React, { Fragment, useEffect, useState } from 'react'

import { KlippetSykepengesoknadRecord, RSSoknadstatusType, Soknad } from '../queryhooks/useSoknader'
import gruppertOgFiltrert, { ArbeidsgiverGruppering } from '../utils/gruppering'
import { Klipp } from '../utils/overlapp'

import { Filter, FilterFelt, ValgteFilter } from './Filter'
import TidslinjeSykmelding from './TidslinjeSykmelding'
import ValgtArbeidsgiver from './ValgtArbeidsgiver'
import TidslinjeArbeidsgiver from './TidslinjeArbeidsgiver'

export function timelinePeriodeStatus(status: RSSoknadstatusType) {
    if (['AVBRUTT', 'SLETTET', 'UTGAATT'].includes(status)) {
        return 'warning'
    }
    if (['SENDT', 'KORRIGERT'].includes(status)) {
        return 'success'
    }
    return 'info'
}

export function SoknadDetaljer({
    soknad,
    filter,
    setFilter,
}: {
    soknad: Soknad
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) {
    return (
        <Fragment>
            {Object.entries(soknad).map(([key, val], idx) => (
                <div key={key + idx}>
                    <FilterFelt prop={key} verdi={val} filter={filter} setFilter={setFilter} />
                    {` ${key}: ${JSON.stringify(val)}`}
                </div>
            ))}
        </Fragment>
    )
}

export function KlippDetaljer({ klipp }: { klipp: Klipp }) {
    return (
        <Fragment>
            {Object.entries(klipp).map(([key, val], idx) => (
                <div key={key + idx}>{`${key}: ${JSON.stringify(val)}`}</div>
            ))}
        </Fragment>
    )
}

export default function Tidslinje({ soknader, klipp }: { soknader: Soknad[]; klipp: KlippetSykepengesoknadRecord[] }) {
    const [soknaderGruppertPaArbeidsgiver, setSoknaderGruppertPaArbeidsgiver] = useState(
        new Map<string, ArbeidsgiverGruppering>(),
    )
    const [arbeidsgiver, setArbeidsgiver] = useState<string>('alle')
    const [filter, setFilter] = useState<Filter[]>([])

    useEffect(() => {
        setSoknaderGruppertPaArbeidsgiver(gruppertOgFiltrert(filter, soknader, klipp))
    }, [soknader, klipp, filter])

    if (soknaderGruppertPaArbeidsgiver.size === 0) {
        return <Fragment />
    }

    return (
        <>
            <ValgtArbeidsgiver
                arbeidsgiver={arbeidsgiver}
                setArbeidsgiver={setArbeidsgiver}
                soknaderGruppertPaArbeidsgiver={soknaderGruppertPaArbeidsgiver}
            />
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <TidslinjeArbeidsgiver
                soknaderGruppertPaArbeidsgiver={soknaderGruppertPaArbeidsgiver}
                arbeidsgiver={arbeidsgiver}
                filter={filter}
                setFilter={setFilter}
            />
            <TidslinjeSykmelding
                soknaderGruppertPaArbeidsgiver={soknaderGruppertPaArbeidsgiver}
                arbeidsgiver={arbeidsgiver}
                filter={filter}
                setFilter={setFilter}
            />
        </>
    )
}
