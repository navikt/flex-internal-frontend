import React, { Fragment, useState } from 'react'
import { StethoscopeIcon, TasklistIcon, SplitHorizontalIcon } from '@navikt/aksel-icons'
import { BodyShort, Timeline } from '@navikt/ds-react'

import { KlippetSykepengesoknadRecord, Soknad, dayjsToDate } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'
import gruppertOgFiltrert, { SoknadGruppering } from '../utils/gruppering'
import { filtrerPaFilter } from '../utils/filterlogikk'
import { hentDatospenn, validerSykmeldingsDatoer } from '../utils/sykmeldingValidering'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../utils/tidslinjeUtils'
import { arbeidsgiverLabelForSoknader } from '../utils/soknadArbeidsgiverLabel'

import { Filter, ValgteFilter } from './Filter'
import VelgZoomPeriode from './VelgZoomPeriode'
import { timelinePeriodeStatus } from './soknad/Tidslinje'
import {
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
    sykmeldingStatus,
    antallKalenderdager,
    formaterDato,
} from './sykmelding/sykmeldingTidslinjeUtils'
import DetaljerDrawer, {
    lagKlippetSoknadDrawerInnhold,
    lagSykmeldingDrawerInnhold,
    lagSoknadDrawerInnhold,
} from './DetaljerDrawer'

interface Props {
    sykmeldinger: Sykmelding[]
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
}

export default function TidslinjeKombinert({ sykmeldinger, soknader, klipp }: Props) {
    const [filter, setFilter] = useState<Filter[]>([])
    const [visningsFraDato, setVisningsFraDato] = useState<Date | null>(null)
    const [visningstilDato, setVisningstilDato] = useState<Date | null>(null)
    const [aktivPeriodeId, setAktivPeriodeId] = useState<string | null>(null)
    const [aktivDrawerKildeId, setAktivDrawerKildeId] = useState<string | null>(null)
    const [drawerInnhold, setDrawerInnhold] = useState<ReturnType<typeof lagSykmeldingDrawerInnhold> | null>(null)

    const gyldigeSykmeldinger = validerSykmeldingsDatoer(sykmeldinger)
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospennSyk = hentDatospenn(filtrerteSykmeldinger)
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    const soknaderGruppert = gruppertOgFiltrert(filter, soknader, klipp)

    let eldsteFra: Date | null = datospennSyk?.startDato ?? null
    let nysteTil: Date | null = datospennSyk?.sluttDato ?? null

    for (const { sykmeldinger: sykGrp } of soknaderGruppert.values()) {
        for (const { soknader: sokGrp } of sykGrp.values()) {
            for (const sok of sokGrp.values()) {
                const fom = dayjsToDate(sok.soknad.fom!)
                const tom = dayjsToDate(sok.soknad.tom!)
                if (fom && (!eldsteFra || fom < eldsteFra)) eldsteFra = fom
                if (tom && (!nysteTil || tom > nysteTil)) nysteTil = tom
            }
        }
    }

    const aktivTidsvindu = beregnAktivTidsvindu(visningsFraDato, visningstilDato, eldsteFra, nysteTil)

    if (!aktivTidsvindu) {
        return <Fragment />
    }

    const sykmeldingRader = Array.from(sykmeldingerGruppertPaArbeidsgiver.entries()).flatMap(
        ([arbeidsgiverId, arbeidsgiver]) => {
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
                const periodeKey = `${sykmelding.id}-${forstePeriode.fom}-${sistePeriode.tom}`

                const periodeInfo = (
                    <div className="space-y-1">
                        <ul className="list-disc pl-5 text-sm">
                            <li>{`Fra: ${formaterDato(forstePeriode.startDato)}`}</li>
                            <li>{`Til: ${formaterDato(sistePeriode.sluttDato)}`}</li>
                            <li>{`Antall delperioder: ${perioder.length}`}</li>
                            <li>{`Antall kalenderdager: ${antallKalenderdager(forstePeriode.startDato, sistePeriode.sluttDato)}`}</li>
                        </ul>
                        {harFlerePerioder && (
                            <ul className="list-disc pl-5 text-sm">
                                {perioder.map((periode, idx) => (
                                    <li
                                        key={idx}
                                    >{`Periode ${idx + 1}: ${formaterDato(periode.startDato)} – ${formaterDato(periode.sluttDato)}`}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )

                const sykmeldingAktivId = sykmelding.id

                return [
                    <Timeline.Period
                        start={forstePeriode.startDato}
                        end={sistePeriode.sluttDato}
                        status={status}
                        icon={ikon}
                        className="ring-1 ring-inset ring-white/95"
                        key={periodeKey}
                        isActive={aktivPeriodeId === sykmeldingAktivId}
                        onSelectPeriod={() => {
                            if (aktivDrawerKildeId === sykmeldingAktivId) {
                                setAktivPeriodeId(null)
                                setAktivDrawerKildeId(null)
                                setDrawerInnhold(null)
                            } else {
                                setAktivPeriodeId(sykmeldingAktivId)
                                setAktivDrawerKildeId(sykmeldingAktivId)
                                setDrawerInnhold(lagSykmeldingDrawerInnhold(sykmelding, periodeInfo, filter, setFilter))
                            }
                        }}
                    />,
                ]
            })

            if (perioder_med_innhold.length === 0) return []

            return [
                <Timeline.Row
                    key={`syk-${arbeidsgiverId}`}
                    label={arbeidsgiver.label}
                    icon={<StethoscopeIcon aria-hidden fontSize="1.5rem" />}
                >
                    {perioder_med_innhold}
                </Timeline.Row>,
            ]
        },
    )

    const soknadRader = Array.from(soknaderGruppert.entries()).flatMap(([arbId, arb]) => {
        const label = arbeidsgiverLabelForSoknader(arbId, arb, soknaderGruppert)

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
                        .map((k) => {
                            const sykmeldingId = k.sykmeldingUuid ?? null
                            const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                            const kildeId = k.id

                            return (
                                <Timeline.Period
                                    start={dayjsToDate(k.fom)!}
                                    end={dayjsToDate(k.tom)!}
                                    status="neutral"
                                    key={k.tom}
                                    isActive={erAktiv}
                                    onSelectPeriod={() => {
                                        if (aktivDrawerKildeId === kildeId) {
                                            setAktivPeriodeId(null)
                                            setAktivDrawerKildeId(null)
                                            setDrawerInnhold(null)
                                        } else {
                                            setAktivPeriodeId(sykmeldingId)
                                            setAktivDrawerKildeId(kildeId)
                                            setDrawerInnhold(lagKlippetSoknadDrawerInnhold(k, filter, setFilter))
                                        }
                                    }}
                                />
                            )
                        })

                    if (!erGhostSykmelding) {
                        const sokFom = dayjsToDate(sok.soknad.fom!)
                        const sokTom = dayjsToDate(sok.soknad.tom!)
                        if (
                            sokFom &&
                            sokTom &&
                            erPeriodeInnenforTidsvindu(sokFom, sokTom, aktivTidsvindu.fra, aktivTidsvindu.til)
                        ) {
                            const sykmeldingId = sok.soknad.sykmeldingId ?? null
                            const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                            const kildeId = sok.soknad.id
                            klippingAvSoknad.push(
                                <Timeline.Period
                                    start={sokFom}
                                    end={sokTom}
                                    status={timelinePeriodeStatus(sok.soknad.status)}
                                    key={sok.soknad.tom}
                                    isActive={erAktiv}
                                    onSelectPeriod={() => {
                                        if (aktivDrawerKildeId === kildeId) {
                                            setAktivPeriodeId(null)
                                            setAktivDrawerKildeId(null)
                                            setDrawerInnhold(null)
                                        } else {
                                            setAktivPeriodeId(sykmeldingId)
                                            setAktivDrawerKildeId(kildeId)
                                            setDrawerInnhold(lagSoknadDrawerInnhold(sok.soknad, filter, setFilter))
                                        }
                                    }}
                                />,
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
                        .map((k) => {
                            const sykmeldingId = k.sykmeldingUuid ?? null
                            const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                            const kildeId = k.id

                            return (
                                <Timeline.Period
                                    start={dayjsToDate(k.fom)!}
                                    end={dayjsToDate(k.tom)!}
                                    status="neutral"
                                    key={k.tom}
                                    isActive={erAktiv}
                                    onSelectPeriod={() => {
                                        if (aktivDrawerKildeId === kildeId) {
                                            setAktivPeriodeId(null)
                                            setAktivDrawerKildeId(null)
                                            setDrawerInnhold(null)
                                        } else {
                                            setAktivPeriodeId(sykmeldingId)
                                            setAktivDrawerKildeId(kildeId)
                                            setDrawerInnhold(lagKlippetSoknadDrawerInnhold(k, filter, setFilter))
                                        }
                                    }}
                                />
                            )
                        }),
                )
        })

        if (perioder_med_innhold.length === 0) return []

        return [
            <Timeline.Row key={`sok-${arbId}`} label={label} icon={<TasklistIcon aria-hidden fontSize="1.5rem" />}>
                {perioder_med_innhold}
            </Timeline.Row>,
        ]
    })

    if (sykmeldingRader.length === 0 && soknadRader.length === 0) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <BodyShort className="font-semibold">{`${filtrerteSykmeldinger.length} sykmelding(er) · ${soknader.length} søknad(er)`}</BodyShort>
            <VelgZoomPeriode setFraDato={setVisningsFraDato} setTilDato={setVisningstilDato} />
            <Timeline
                endDate={aktivTidsvindu.til}
                startDate={aktivTidsvindu.fra}
                key={`${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {sykmeldingRader}
                {soknadRader}
            </Timeline>
            <DetaljerDrawer
                innhold={drawerInnhold}
                onLukk={() => {
                    setAktivDrawerKildeId(null)
                    setDrawerInnhold(null)
                }}
            />
        </div>
    )
}
