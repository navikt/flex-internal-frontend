import React, { useState } from 'react'
import { BodyShort, Button, Timeline } from '@navikt/ds-react'

import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { Detaljer } from '../Detaljer'
import type { Filter } from '../Filter'

import { antallKalenderdager, formaterDato } from './sykmeldingTidslinjeUtils'
import type { PeriodeMedDatoer } from './sykmeldingTidslinjeUtils'

interface SykmeldingPeriodePopoverProps {
    sykmelding: Sykmelding
    perioder: PeriodeMedDatoer[]
    status: 'success' | 'warning' | 'info'
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}

const SykmeldingPeriodePopover = ({
    sykmelding,
    perioder,
    status,
    filter,
    setFilter,
}: SykmeldingPeriodePopoverProps) => {
    const [visAlleDetaljer, setVisAlleDetaljer] = useState(false)
    const forstePeriode = perioder[0]
    const sistePeriode = perioder[perioder.length - 1]
    const harFlerePerioder = perioder.length > 1
    const antallDager = antallKalenderdager(forstePeriode.startDato, sistePeriode.sluttDato)
    const breddeKlasse = visAlleDetaljer ? 'w-screen max-w-screen' : 'w-[460px] max-w-[80vw]'

    return (
        <div className={`${breddeKlasse} space-y-3`}>
            <div>
                <BodyShort size="small" className="font-semibold">
                    Oversikt for sykmelding
                </BodyShort>
                <ul className="mt-1 list-disc pl-5 text-sm">
                    <li>{`Fra: ${formaterDato(forstePeriode.startDato)}`}</li>
                    <li>{`Til: ${formaterDato(sistePeriode.sluttDato)}`}</li>
                    <li>{`Antall delperioder: ${perioder.length}`}</li>
                    <li>{`Antall kalenderdager: ${antallDager}`}</li>
                </ul>
            </div>
            {harFlerePerioder ? (
                <>
                    <BodyShort size="small" className="font-semibold">
                        Delperioder i sykmeldingen
                    </BodyShort>
                    <div>
                        <ul className="mt-1 list-disc pl-5 text-sm">
                            {perioder.map((periode, idx) => (
                                <li key={`${sykmelding.id}-periodeinfo-${idx}-${periode.fom}-${periode.tom}`}>
                                    {`Periode ${idx + 1}: ${formaterDato(periode.startDato)} - ${formaterDato(periode.sluttDato)}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Timeline key={`${sykmelding.id}-delperioder`}>
                        <Timeline.Row label="Perioder">
                            {perioder.map((periode, idx) => (
                                <Timeline.Period
                                    start={periode.startDato}
                                    end={periode.sluttDato}
                                    status={status}
                                    key={`${sykmelding.id}-delperiode-${idx}-${periode.fom}-${periode.tom}`}
                                />
                            ))}
                        </Timeline.Row>
                    </Timeline>
                </>
            ) : null}
            <Button
                size="small"
                variant="tertiary"
                onClick={() => setVisAlleDetaljer((forrige) => !forrige)}
                aria-expanded={visAlleDetaljer}
            >
                {visAlleDetaljer ? 'Skjul alle detaljer' : 'Vis alle detaljer'}
            </Button>
            {visAlleDetaljer ? <Detaljer objekt={sykmelding} filter={filter} setFilter={setFilter} /> : null}
        </div>
    )
}

export default SykmeldingPeriodePopover
