import React, { useEffect, useState } from 'react'
import { Alert, Search } from '@navikt/ds-react'

import { useSoknad } from '../queryhooks/useSoknad'
import { useSykmelding } from '../queryhooks/useSykmelding'
import { validerUuid } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'

export const IdOppslagSokefelt = () => {
    const { settFnr } = useValgtFnr()
    const [id, setId] = useState<string>()
    const [feilmelding, setFeilmelding] = useState<string>()

    const { data: soknadData, isFetching: henterSoknad } = useSoknad(id, id !== undefined)
    const { data: sykmeldingData, isFetching: henterSykmelding } = useSykmelding(id, id !== undefined)

    const fnrFraSoknad = soknadData?.fnr
    const fnrFraSykmelding = sykmeldingData?.fnr ?? sykmeldingData?.sykmelding?.pasient?.fnr

    const funnetFnr = fnrFraSoknad ?? fnrFraSykmelding

    const harSokt = id !== undefined
    const laster = henterSoknad || henterSykmelding
    const ikkeFunnet = harSokt && !laster && !funnetFnr

    useEffect(() => {
        if (funnetFnr) {
            settFnr(funnetFnr)
            setId(undefined)
        }
    }, [funnetFnr, settFnr])

    const handterSok = (input: string) => {
        setFeilmelding(undefined)
        const validertId = validerUuid(input)
        if (!validertId) {
            setFeilmelding('ID må være en UUID på 36 tegn')
            setId(undefined)
            return
        }
        setId(validertId)
    }

    return (
        <div className="space-y-2">
            <Search
                hideLabel={false}
                htmlSize="40"
                label="Slå opp fnr fra søknad-ID eller sykmelding-ID"
                description="Limer inn en UUID for å finne tilhørende fødselsnummer og vise tidslinjen"
                error={feilmelding}
                onSearchClick={handterSok}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterSok(evt.currentTarget.value)
                    }
                }}
            />
            {ikkeFunnet && <Alert variant="warning">Fant ikke fnr for oppgitt ID</Alert>}
        </div>
    )
}

export default IdOppslagSokefelt
