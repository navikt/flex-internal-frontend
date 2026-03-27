import React, { Fragment, useState } from 'react'
import { Timeline } from '@navikt/ds-react'

import { ArbeidsgiverGruppering, SoknadGruppering, sortert, SykmeldingGruppering } from '../../utils/gruppering'
import { dayjsToDate } from '../../queryhooks/useSoknader'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import { Filter } from '../Filter'
import { Detaljer } from '../Detaljer'
import VelgZoomPeriode from '../VelgZoomPeriode'

import ValgtSortering, { Sortering } from './ValgtSortering'
import OverlappendeTidslinjeRad from './OverlappendeTidslinjeRad'
import { KlippDetaljer, timelinePeriodeStatus } from './Tidslinje'
import KlippBugInfo from './KlippBugInfo'

export default function TidslinjeSykmelding({
    soknaderGruppertPaArbeidsgiver,
    arbeidsgiver,
    filter,
    setFilter,
    visningsFraDato,
    visningstilDato,
    setVisningsFraDato,
    setVisningstilDato,
}: {
    soknaderGruppertPaArbeidsgiver: Map<string, ArbeidsgiverGruppering>
    arbeidsgiver: string
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    visningsFraDato: Date | null
    visningstilDato: Date | null
    setVisningsFraDato: (date: Date | null) => void
    setVisningstilDato: (date: Date | null) => void
}) {
    const [sortering, setSortering] = useState<Sortering>('sykmelding skrevet')
    const soknaderGruppertPaSykmeldinger = new Map<string, SykmeldingGruppering>()

    function sykmeldingLabel(sykId: string) {
        if (sykId.includes('_GHOST')) {
            return 'Sykmelding 👻'
        }
        if (sykId.includes('_KORRIGERT')) {
            return 'Korrigert '
        }
        return 'Sykmelding'
    }

    if (arbeidsgiver === 'alle') {
        return <Fragment />
    }

    Array.from(soknaderGruppertPaArbeidsgiver.entries())
        .filter(([arbId]) => arbId.includes(arbeidsgiver) || arbId.endsWith('_GHOST'))
        .forEach(([arbId, arb]) => {
            const overlappIndex = arbId.slice(8)

            Array.from(arb.sykmeldinger).forEach(([sykId, syk]) => {
                const id = sykId + overlappIndex
                soknaderGruppertPaSykmeldinger.set(id, syk)
            })
        })

    if (soknaderGruppertPaSykmeldinger.size === 0) {
        return <Fragment />
    }

    // Beregn default tidsvindu hvis ikke satt
    let eldsteFra: Date | null = null
    let nysteTil: Date | null = null

    for (const { soknader } of soknaderGruppertPaSykmeldinger.values()) {
        for (const sok of soknader.values()) {
            const fom = dayjsToDate(sok.soknad.fom!)
            const tom = dayjsToDate(sok.soknad.tom!)
            if (fom && (!eldsteFra || fom < eldsteFra)) eldsteFra = fom
            if (tom && (!nysteTil || tom > nysteTil)) nysteTil = tom
        }
    }

    const aktivTidsvindu = beregnAktivTidsvindu(visningsFraDato, visningstilDato, eldsteFra, nysteTil)

    if (!aktivTidsvindu) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgtSortering sortering={sortering} setSortering={setSortering} />
            <VelgZoomPeriode setFraDato={setVisningsFraDato} setTilDato={setVisningstilDato} />
            <OverlappendeTidslinjeRad sykmeldingGruppering={soknaderGruppertPaSykmeldinger} />
            <KlippBugInfo sykmeldingGruppering={soknaderGruppertPaSykmeldinger} />
            <Timeline
                endDate={aktivTidsvindu.til}
                startDate={aktivTidsvindu.fra}
                key={`${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {Array.from(soknaderGruppertPaSykmeldinger.entries())
                    .sort((a, b) => sortert(a, b, sortering))
                    .flatMap(([sykId, syk]) => {
                        const erGhostSykmelding = sykId.includes('_GHOST')

                        const perioder_med_innhold = Array.from(syk.soknader.values())
                            .flatMap((sok: SoknadGruppering) => {
                                const klippingAvSoknad = sok.klippingAvSoknad
                                    .filter((k) => {
                                        const fom = dayjsToDate(k.fom)
                                        const tom = dayjsToDate(k.tom)
                                        return (
                                            fom &&
                                            tom &&
                                            erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                                        )
                                    })
                                    .map((k) => (
                                        <Timeline.Period
                                            start={dayjsToDate(k.fom)!}
                                            end={dayjsToDate(k.tom)!}
                                            status="neutral"
                                            key={k.tom}
                                        >
                                            <KlippDetaljer klipp={k} />
                                        </Timeline.Period>
                                    ))

                                if (!erGhostSykmelding) {
                                    const sokFom = dayjsToDate(sok.soknad.fom!)
                                    const sokTom = dayjsToDate(sok.soknad.tom!)
                                    if (
                                        sokFom &&
                                        sokTom &&
                                        erPeriodeInnenforTidsvindu(
                                            sokFom,
                                            sokTom,
                                            aktivTidsvindu.fra,
                                            aktivTidsvindu.til,
                                        )
                                    ) {
                                        klippingAvSoknad.push(
                                            <Timeline.Period
                                                start={sokFom}
                                                end={sokTom}
                                                status={timelinePeriodeStatus(sok.soknad.status)}
                                                key={sok.soknad.tom}
                                            >
                                                <Detaljer objekt={sok.soknad} filter={filter} setFilter={setFilter} />
                                            </Timeline.Period>,
                                        )
                                    }
                                }

                                return klippingAvSoknad
                            })
                            .concat(
                                syk.klippingAvSykmelding
                                    .filter((k) => {
                                        const fom = dayjsToDate(k.fom)
                                        const tom = dayjsToDate(k.tom)
                                        return (
                                            fom &&
                                            tom &&
                                            erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                                        )
                                    })
                                    .map((k) => (
                                        <Timeline.Period
                                            start={dayjsToDate(k.fom)!}
                                            end={dayjsToDate(k.tom)!}
                                            status="neutral"
                                            key={k.tom}
                                        >
                                            <KlippDetaljer klipp={k} />
                                        </Timeline.Period>
                                    )),
                            )

                        if (perioder_med_innhold.length === 0) {
                            return []
                        }

                        return [
                            <Timeline.Row key={sykId} label={sykmeldingLabel(sykId)}>
                                {perioder_med_innhold}
                            </Timeline.Row>,
                        ]
                    })}
            </Timeline>
        </div>
    )
}
