import React, { useState } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { Alert, BodyShort, Box, Label, Search, Loader } from '@navikt/ds-react'
import { CheckmarkCircleFillIcon, CircleSlashFillIcon } from '@navikt/aksel-icons'

import { initialProps } from '../initialprops/initialProps'
import { useVentetid } from '../queryhooks/useVentetid'
import { formaterDato, toDatePaakrevd } from '../utils/dato-utils'
import { handterUuidValidering } from '../utils/inputValidering'

export function beregnAntallKalenderdager(periode: { fom: string; tom: string } | undefined): number | null {
    if (!periode) {
        return null
    }

    return differenceInCalendarDays(toDatePaakrevd(periode.tom, 'tom'), toDatePaakrevd(periode.fom, 'fom')) + 1
}

function formaterPeriodeDato(dato: string): string {
    return formaterDato(toDatePaakrevd(dato, 'dato'), 'dd.MM.yyyy')
}

const VentetidPage = () => {
    const [sykmeldingId, setSykmeldingId] = useState<string>()
    const { data, isError, error, isLoading } = useVentetid(sykmeldingId, sykmeldingId !== undefined)
    const erUtenforVentetid = data?.erUtenforVentetid
    const ventetid = data?.ventetid
    const sykmeldingsperiode = data?.sykmeldingsperiode
    const antallVentetidsdager = beregnAntallKalenderdager(ventetid)
    const antallSykmeldingsdager = beregnAntallKalenderdager(sykmeldingsperiode)

    function postfiksAntall(antall: number | null) {
        if (antall === null) return ''
        return `${antall} ${antall === 1 ? 'dag' : 'dager'}`
    }

    const erUtenforVentetidenIkon = (
        <CheckmarkCircleFillIcon
            className="text-ax-success-700"
            aria-label="Utenfor ventetiden"
            title="Utenfor ventetiden"
            fontSize="1.5rem"
        />
    )

    const erInnenforVentetidenIkon = (
        <CircleSlashFillIcon
            className="text-ax-danger-700"
            aria-label="Innenfor ventetiden"
            title="Innenfor ventetiden"
            fontSize="1.5rem"
        />
    )

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="40"
                label="Søk sykmeldingId"
                onSearchClick={(input) => {
                    handterUuidValidering(
                        input,
                        setSykmeldingId,
                        () => setSykmeldingId(undefined),
                        'SykmeldingId må være en UUID på 36 tegn',
                    )
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterUuidValidering(
                            evt.currentTarget.value,
                            setSykmeldingId,
                            () => setSykmeldingId(undefined),
                            'SykmeldingId må være en UUID på 36 tegn',
                        )
                    }
                }}
            />
            {isError && <Alert variant="error">Feil ved henting av ventetid: {String(error)}</Alert>}

            {!isError &&
                (isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader size="small" title="Laster" aria-live="polite" />
                        <BodyShort>Henter ventetid...</BodyShort>
                    </div>
                ) : data ? (
                    <Box>
                        {erUtenforVentetid && <Label className="mt-5">Ventetid:</Label>}
                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 mt-2">
                            {erUtenforVentetid && (
                                <>
                                    <BodyShort>Utenfor ventetiden:</BodyShort>
                                    <div className="flex items-center">
                                        {erUtenforVentetid ? erUtenforVentetidenIkon : erInnenforVentetidenIkon}
                                    </div>
                                </>
                            )}

                            {ventetid && (
                                <>
                                    <BodyShort>Ventetid:</BodyShort>
                                    <BodyShort>
                                        {`${formaterPeriodeDato(ventetid.fom)} - ${formaterPeriodeDato(ventetid.tom)} (${postfiksAntall(antallVentetidsdager)})`}
                                    </BodyShort>
                                </>
                            )}

                            {sykmeldingsperiode && (
                                <>
                                    <BodyShort>Sykmeldingsperiode:</BodyShort>
                                    <BodyShort>
                                        {`${formaterPeriodeDato(sykmeldingsperiode.fom)} - ${formaterPeriodeDato(sykmeldingsperiode.tom)} (${postfiksAntall(antallSykmeldingsdager)})`}
                                    </BodyShort>
                                </>
                            )}
                        </div>
                    </Box>
                ) : null)}
        </div>
    )
}

export const getServerSideProps = initialProps

export default VentetidPage
