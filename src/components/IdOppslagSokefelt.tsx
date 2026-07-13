import React, { useEffect, useState } from 'react'
import { InlineMessage, Search } from '@navikt/ds-react'

import { useSoknad } from '../queryhooks/useSoknad'
import { useSykmelding } from '../queryhooks/useSykmelding'
import { Soknad } from '../queryhooks/useSoknader'
import { validerUuid } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'

export const IdOppslagSokefelt = () => {
    const { settFnr, settValgtPeriode } = useValgtFnr()
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
        if (!funnetFnr) return

        settFnr(funnetFnr)

        // Hent relevante id-er for å markere periode på tidslinjen
        const sykmeldingId = sykmeldingData?.sykmelding?.id ?? null
        const soknad = soknadData?.sykepengesoknad as Soknad | undefined
        const soknadId = soknad?.id ?? null
        const soknadSykmeldingId = soknad?.sykmeldingId ?? null

        if (typeof settValgtPeriode === 'function') {
            // Hvis vi har sykmeldingId, bruk den som periodeId, ellers bruk soknad-kildeId
            const periodeId = sykmeldingId ?? soknadSykmeldingId ?? null
            const kildeId = sykmeldingId ?? soknadId ?? null
            const data = {
                sykmelding: sykmeldingData?.sykmelding ?? undefined,
                soknad: soknad ?? undefined,
            }
            settValgtPeriode(periodeId, kildeId, data)
        }

        // Utfør clear av id asynkront for å unngå synkrone setState i effect
        const timer = setTimeout(() => setId(undefined), 0)
        return () => clearTimeout(timer)
    }, [funnetFnr, settFnr, sykmeldingData, soknadData, settValgtPeriode])

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
        <>
            <Search
                hideLabel={false}
                htmlSize="40"
                label="Søknad-ID eller sykmelding-ID"
                description="Lim inn UUID for å finne tilhørende fødselsnummer"
                error={feilmelding}
                onSearchClick={handterSok}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterSok(evt.currentTarget.value)
                    }
                }}
            />
            {ikkeFunnet && (
                <InlineMessage status="warning" role="alert" className="mt-2">
                    Fant ikke fnr for oppgitt ID
                </InlineMessage>
            )}
        </>
    )
}

export default IdOppslagSokefelt
