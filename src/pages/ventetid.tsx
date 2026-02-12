import React, { useState } from 'react'
import { Alert, BodyShort, Box, Label, Search, Loader } from '@navikt/ds-react'
import { CheckmarkCircleFillIcon, CircleSlashFillIcon } from '@navikt/aksel-icons'
import dayjs from 'dayjs'

import { initialProps } from '../initialprops/initialProps'
import { useVentetid } from '../queryhooks/useVentetid'
import { handterUuidValidering } from '../utils/inputValidering'

const VentetidPage = () => {
    const [sykmeldingId, setSykmeldingId] = useState<string>()
    const { data, isError, error, isLoading } = useVentetid(sykmeldingId, sykmeldingId !== undefined)
    const erUtenforVentetid = data?.erUtenforVentetid
    const ventetid = data?.ventetid
    const sykmeldingsperiode = data?.sykmeldingsperiode
    const syketilfellebiter = data?.syketilfellebiter
    const antallVentetidsdager = ventetid ? dayjs(ventetid.tom).diff(dayjs(ventetid.fom), 'day') + 1 : null
    const antallSykmeldingsdager = sykmeldingsperiode
        ? dayjs(sykmeldingsperiode.tom).diff(dayjs(sykmeldingsperiode.fom), 'day') + 1
        : null

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
                                        {`${dayjs(ventetid.fom).format('DD.MM.YYYY')} - ${dayjs(ventetid.tom).format('DD.MM.YYYY')} (${postfiksAntall(antallVentetidsdager)})`}
                                    </BodyShort>
                                </>
                            )}

                            {sykmeldingsperiode && (
                                <>
                                    <BodyShort>Sykmeldingsperiode:</BodyShort>
                                    <BodyShort>
                                        {`${dayjs(sykmeldingsperiode.fom).format('DD.MM.YYYY')} - ${dayjs(sykmeldingsperiode.tom).format('DD.MM.YYYY')} (${postfiksAntall(antallSykmeldingsdager)})`}
                                    </BodyShort>
                                </>
                            )}
                        </div>
                        {syketilfellebiter && (
                            <div className="mt-4">
                                <Label>Syketilfellebiter:</Label>
                                <div className="mt-2 rounded-sm bg-ax-neutral-200 p-3">
                                    <pre className="whitespace-pre-wrap font-mono text-xs">
                                        {JSON.stringify(syketilfellebiter, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </Box>
                ) : null)}
        </div>
    )
}

export const getServerSideProps = initialProps

export default VentetidPage
