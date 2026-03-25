import React, { Fragment } from 'react'
import { SplitHorizontalIcon } from '@navikt/aksel-icons'
import { BodyShort, Timeline } from '@navikt/ds-react'

import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { filtrerPaFilter } from '../../utils/filterlogikk'
import { hentDatospenn, validerSykmeldingsDatoer } from '../../utils/sykmeldingValidering'
import type { Filter } from '../Filter'

import SykmeldingPeriodePopover from './SykmeldingPeriodePopover'
import {
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
    sykmeldingStatus,
} from './sykmeldingTidslinjeUtils'

interface TidslinjeSykmeldingerProps {
    sykmeldinger: Sykmelding[]
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}
const TidslinjeSykmeldinger = ({ sykmeldinger, filter, setFilter }: TidslinjeSykmeldingerProps) => {
    const gyldigeSykmeldinger = validerSykmeldingsDatoer(sykmeldinger)
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospenn = hentDatospenn(filtrerteSykmeldinger)
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    if (filtrerteSykmeldinger.length === 0 || !datospenn) return <Fragment />

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <BodyShort className="mb-2 font-semibold">{`${filtrerteSykmeldinger.length} sykmelding(er)`}</BodyShort>

            <Timeline key={datospenn.sluttDato.toISOString()}>
                {Array.from(sykmeldingerGruppertPaArbeidsgiver.entries()).map(([arbeidsgiverId, arbeidsgiver]) => {
                    const label = arbeidsgiverId.includes('(') ? `${arbeidsgiver.navn} (overlapp)` : arbeidsgiver.navn

                    return (
                        <Timeline.Row key={arbeidsgiverId} label={label}>
                            {arbeidsgiver.sykmeldinger.flatMap((sykmelding) => {
                                const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)
                                const perioder = sorterPerioder(perioderMedDatoer(sykmelding))

                                if (perioder.length === 0) return []

                                const forstePeriode = perioder[0]
                                const sistePeriode = perioder[perioder.length - 1]
                                const harFlerePerioder = perioder.length > 1
                                const ikon = harFlerePerioder ? <SplitHorizontalIcon aria-hidden /> : undefined

                                return [
                                    <Timeline.Period
                                        start={forstePeriode.startDato}
                                        end={sistePeriode.sluttDato}
                                        status={status}
                                        icon={ikon}
                                        className="ring-1 ring-inset ring-white/95"
                                        key={`${sykmelding.id}-${forstePeriode.fom}-${sistePeriode.tom}`}
                                    >
                                        <SykmeldingPeriodePopover
                                            sykmelding={sykmelding}
                                            perioder={perioder}
                                            status={status}
                                            filter={filter}
                                            setFilter={setFilter}
                                        />
                                    </Timeline.Period>,
                                ]
                            })}
                        </Timeline.Row>
                    )
                })}
                <Timeline.Zoom>
                    <Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
                    <Timeline.Zoom.Button label="7 mnd" interval="month" count={7} />
                    <Timeline.Zoom.Button label="9 mnd" interval="month" count={9} />
                    <Timeline.Zoom.Button label="2 år" interval="year" count={2} />
                </Timeline.Zoom>
            </Timeline>
        </div>
    )
}

export default TidslinjeSykmeldinger
