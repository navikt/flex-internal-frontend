import React, { Fragment, useState } from 'react'
import { SplitHorizontalIcon } from '@navikt/aksel-icons'
import { BodyShort, Timeline } from '@navikt/ds-react'

import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { filtrerPaFilter } from '../../utils/filterlogikk'
import { hentDatospenn, validerSykmeldingsDatoer } from '../../utils/sykmeldingValidering'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import type { Filter } from '../Filter'
import VelgZoomPeriode from '../VelgZoomPeriode'

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

    const [visningsFraDato, setVisningsFraDato] = useState<Date | null>(null)
    const [visningstilDato, setVisningstilDato] = useState<Date | null>(null)

    const aktivTidsvindu = beregnAktivTidsvindu(
        visningsFraDato,
        visningstilDato,
        datospenn?.startDato ?? null,
        datospenn?.sluttDato ?? null,
    )

    if (filtrerteSykmeldinger.length === 0 || !datospenn || !aktivTidsvindu) return <Fragment />

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <BodyShort className="mb-2 font-semibold">{`${filtrerteSykmeldinger.length} sykmelding(er)`}</BodyShort>

            <VelgZoomPeriode setFraDato={setVisningsFraDato} setTilDato={setVisningstilDato} />

            <Timeline
                endDate={aktivTidsvindu.til}
                startDate={aktivTidsvindu.fra}
                key={`${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {Array.from(sykmeldingerGruppertPaArbeidsgiver.entries()).flatMap(([arbeidsgiverId, arbeidsgiver]) => {
                    const perioder_med_innhold = arbeidsgiver.sykmeldinger.flatMap((sykmelding) => {
                        const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)
                        const perioder = sorterPerioder(perioderMedDatoer(sykmelding))

                        if (perioder.length === 0) return []

                        const forstePeriode = perioder[0]
                        const sistePeriode = perioder[perioder.length - 1]

                        if (
                            !erPeriodeInnenforTidsvindu(
                                forstePeriode.startDato,
                                sistePeriode.sluttDato,
                                aktivTidsvindu.fra,
                                aktivTidsvindu.til,
                            )
                        ) {
                            return []
                        }

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
                    })

                    if (perioder_med_innhold.length === 0) {
                        return []
                    }

                    return [
                        <Timeline.Row key={arbeidsgiverId} label={arbeidsgiver.label}>
                            {perioder_med_innhold}
                        </Timeline.Row>,
                    ]
                })}
            </Timeline>
        </div>
    )
}

export default TidslinjeSykmeldinger
