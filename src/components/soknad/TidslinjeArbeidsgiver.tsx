import { Timeline } from '@navikt/ds-react'
import React, { Fragment } from 'react'

import { ArbeidsgiverGruppering, SoknadGruppering } from '../../utils/gruppering'
import { arbeidsgiverLabelForSoknader } from '../../utils/soknadArbeidsgiverLabel'
import { dayjsToDate } from '../../queryhooks/useSoknader'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import { Filter } from '../Filter'
import { Detaljer } from '../Detaljer'
import VelgZoomPeriode from '../VelgZoomPeriode'

import { KlippDetaljer, timelinePeriodeStatus } from './Tidslinje'

export default function TidslinjeArbeidsgiver({
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
    if (arbeidsgiver !== 'alle') {
        return <Fragment />
    }

    // Beregn default tidsvindu hvis ikke satt
    let eldsteFra: Date | null = null
    let nysteTil: Date | null = null

    for (const [arbId, { sykmeldinger }] of soknaderGruppertPaArbeidsgiver.entries()) {
        for (const { soknader } of sykmeldinger.values()) {
            for (const sok of soknader.values()) {
                const erOppholdUtland = arbId === 'opphold_utland'
                const fom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.fom!)
                const tom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.tom!)
                if (fom && (!eldsteFra || fom < eldsteFra)) eldsteFra = fom
                if (tom && (!nysteTil || tom > nysteTil)) nysteTil = tom
            }
        }
    }

    const aktivTidsvindu = beregnAktivTidsvindu(visningsFraDato, visningstilDato, eldsteFra, nysteTil)

    if (!aktivTidsvindu) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <VelgZoomPeriode setFraDato={setVisningsFraDato} setTilDato={setVisningstilDato} />
            <Timeline
                endDate={aktivTidsvindu.til}
                startDate={aktivTidsvindu.fra}
                key={`${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {Array.from(soknaderGruppertPaArbeidsgiver.entries()).flatMap(([arbId, arb]) => {
                    const erOppholdUtland = arbId === 'opphold_utland'
                    const label = erOppholdUtland
                        ? 'Opphold utland'
                        : arbeidsgiverLabelForSoknader(arbId, arb, soknaderGruppertPaArbeidsgiver)

                    const perioder_med_innhold = Array.from(arb.sykmeldinger.entries()).flatMap(([sykId, syk]) => {
                        const erGhostSykmelding = sykId.endsWith('_GHOST')

                        return Array.from(syk.soknader.values())
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

                                if (erOppholdUtland) {
                                    const dato = dayjsToDate(sok.soknad.opprettetDato)
                                    if (
                                        dato &&
                                        erPeriodeInnenforTidsvindu(dato, dato, aktivTidsvindu.fra, aktivTidsvindu.til)
                                    ) {
                                        klippingAvSoknad.push(
                                            <Timeline.Period
                                                start={dato}
                                                end={dato}
                                                status={timelinePeriodeStatus(sok.soknad.status)}
                                                key={sok.soknad.id}
                                            >
                                                <Detaljer objekt={sok.soknad} filter={filter} setFilter={setFilter} />
                                            </Timeline.Period>,
                                        )
                                    }
                                } else if (!erGhostSykmelding) {
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
                                                key={sok.soknad.tom?.toISOString() ?? sok.soknad.id}
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
                    })

                    if (perioder_med_innhold.length === 0) {
                        return []
                    }

                    return [
                        <Timeline.Row key={arbId} label={label}>
                            {perioder_med_innhold}
                        </Timeline.Row>,
                    ]
                })}
            </Timeline>
        </div>
    )
}
