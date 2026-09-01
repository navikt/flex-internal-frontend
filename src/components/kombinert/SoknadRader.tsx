import React from 'react'
import { TasklistIcon } from '@navikt/aksel-icons'
import { Timeline } from '@navikt/ds-react'

import { ArbeidsgiverGruppering, SoknadGruppering } from '../../utils/gruppering'
import { formaterDato, toDateEllerUndefined } from '../../utils/dato-utils'
import type { Klipp } from '../../utils/overlapp'
import { erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import { ikonParForSoknad, ikonerForSoknad, klippIkon } from '../../utils/tidslinjeIkonUtils'
import { sorterSoknadGrupperEtterSignaturDato } from '../../utils/kombinertTidslinjeSortering'
import { arbeidsgiverLabelForSoknader } from '../../utils/soknadArbeidsgiverLabel'
import { lagKlippetSoknadDrawerInnhold, lagSoknadDrawerInnhold } from '../DetaljerDrawer'
import ViktigeFeltForSoknad from '../periodeinfo/ViktigeFeltForSoknad'
import { timelinePeriodeStatus } from '../soknad/Tidslinje'

import type { SammenlignElement } from './useTidslinjeKombinert'
import type { OnPeriodeValgt } from './SykmeldingRader'

interface TidslinjePeriodeMedElement {
    start: Date
    end: Date
    element: React.ReactElement
}

const lagKlippPeriodeMedElement = (
    k: Klipp,
    aktivTidsvindu: { fra: Date; til: Date },
    aktivPeriodeId: string | null,
    aktivDrawerKildeId: string | null,
    onPeriodeValgt: OnPeriodeValgt,
): TidslinjePeriodeMedElement | null => {
    const start = toDateEllerUndefined(k.fom)
    const end = toDateEllerUndefined(k.tom)
    if (!start || !end) return null

    if (!erPeriodeInnenforTidsvindu(start, end, aktivTidsvindu.fra, aktivTidsvindu.til)) return null

    const sykmeldingId = k.sykmeldingUuid ?? null
    const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
    const kildeId = k.id
    const erValgtPeriode = aktivDrawerKildeId === kildeId

    return {
        start,
        end,
        element: (
            <Timeline.Period
                start={start}
                end={end}
                status="neutral"
                key={k.id}
                icon={klippIkon}
                isActive={erAktiv}
                className={erValgtPeriode ? 'shadow-[inset_0_0_0_4px_#dc2626]!' : undefined}
                onSelectPeriod={() => {
                    if (aktivDrawerKildeId === kildeId) {
                        onPeriodeValgt(null, null, null)
                    } else {
                        onPeriodeValgt(sykmeldingId, kildeId, lagKlippetSoknadDrawerInnhold(k))
                    }
                }}
            />
        ),
    }
}

const sorterPerioderForSpor = (a: TidslinjePeriodeMedElement, b: TidslinjePeriodeMedElement) => {
    const startDiff = a.start.getTime() - b.start.getTime()
    if (startDiff !== 0) return startDiff

    const sluttDiff = a.end.getTime() - b.end.getTime()
    if (sluttDiff !== 0) return sluttDiff

    return 0
}

const grupperPerioderISpor = (perioder: TidslinjePeriodeMedElement[]): TidslinjePeriodeMedElement[][] => {
    const spor: TidslinjePeriodeMedElement[][] = []

    perioder
        .slice()
        .sort(sorterPerioderForSpor)
        .forEach((periode) => {
            const eksisterendeSpor = spor.find((enkeltSpor) => {
                const sistePeriode = enkeltSpor[enkeltSpor.length - 1]
                return sistePeriode.end.getTime() < periode.start.getTime()
            })

            if (eksisterendeSpor) {
                eksisterendeSpor.push(periode)
            } else {
                spor.push([periode])
            }
        })

    return spor
}

interface Props {
    soknaderGruppert: Map<string, ArbeidsgiverGruppering>
    aktivTidsvindu: { fra: Date; til: Date }
    aktivPeriodeId: string | null
    aktivDrawerKildeId: string | null
    onPeriodeValgt: OnPeriodeValgt
    sammenlignModus?: boolean
    sammenlignValgteIder?: string[]
    onSammenlignValgt?: (element: SammenlignElement) => void
}

export const lagSoknadRader = ({
    soknaderGruppert,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
    sammenlignModus = false,
    sammenlignValgteIder = [],
    onSammenlignValgt,
}: Props): React.ReactElement[] => {
    return sorterSoknadGrupperEtterSignaturDato(Array.from(soknaderGruppert.entries())).flatMap(([arbId, arb]) => {
        if (arbId === 'opphold_utland') return []

        const label = arbeidsgiverLabelForSoknader(arbId, arb, soknaderGruppert)

        const perioderMedInnhold = Array.from(arb.sykmeldinger.entries()).flatMap(([sykId, syk]) => {
            const erGhostSykmelding = sykId.endsWith('_GHOST')

            return Array.from(syk.soknader.values())
                .flatMap((sok: SoknadGruppering) => {
                    const klippingAvSoknad = sok.klippingAvSoknad
                        .map((k) =>
                            lagKlippPeriodeMedElement(
                                k,
                                aktivTidsvindu,
                                aktivPeriodeId,
                                aktivDrawerKildeId,
                                onPeriodeValgt,
                            ),
                        )
                        .filter((periode): periode is TidslinjePeriodeMedElement => periode !== null)

                    if (!erGhostSykmelding) {
                        const sokFom = sok.soknad.fom
                        const sokTom = sok.soknad.tom
                        if (
                            sokFom &&
                            sokTom &&
                            erPeriodeInnenforTidsvindu(sokFom, sokTom, aktivTidsvindu.fra, aktivTidsvindu.til)
                        ) {
                            const sykmeldingId = sok.soknad.sykmeldingId ?? null
                            const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                            const kildeId = sok.soknad.id
                            const erValgtPeriode = aktivDrawerKildeId === kildeId
                            const erSammenlignValgt = sammenlignValgteIder.includes(kildeId)

                            const fomStr = sok.soknad.fom ? formaterDato(sok.soknad.fom, 'd MMM yyyy') : ''
                            const tomStr = sok.soknad.tom ? formaterDato(sok.soknad.tom, 'd MMM yyyy') : ''

                            klippingAvSoknad.push({
                                start: sokFom,
                                end: sokTom,
                                element: (
                                    <Timeline.Period
                                        start={sokFom}
                                        end={sokTom}
                                        status={timelinePeriodeStatus(sok.soknad.status)}
                                        icon={ikonerForSoknad(sok.soknad)}
                                        key={sok.soknad.id}
                                        isActive={erAktiv}
                                        className={
                                            sammenlignModus
                                                ? erSammenlignValgt
                                                    ? 'shadow-[inset_0_0_0_4px_#0067c5]!'
                                                    : undefined
                                                : erValgtPeriode
                                                  ? 'shadow-[inset_0_0_0_4px_#dc2626]!'
                                                  : undefined
                                        }
                                        onSelectPeriod={() => {
                                            if (sammenlignModus) {
                                                onSammenlignValgt?.({
                                                    kildeId,
                                                    objekt: sok.soknad,
                                                    tittel: `Søknad ${fomStr}–${tomStr}`,
                                                })
                                            } else if (aktivDrawerKildeId === kildeId) {
                                                onPeriodeValgt(null, null, null)
                                            } else {
                                                onPeriodeValgt(
                                                    sykmeldingId,
                                                    kildeId,
                                                    lagSoknadDrawerInnhold(
                                                        sok.soknad,
                                                        <ViktigeFeltForSoknad soknad={sok.soknad} />,
                                                        ikonParForSoknad(sok.soknad),
                                                    ),
                                                )
                                            }
                                        }}
                                    />
                                ),
                            })
                        }
                    }

                    return klippingAvSoknad
                })
                .concat(
                    syk.klippingAvSykmelding
                        .filter((k) => {
                            const fom = toDateEllerUndefined(k.fom)
                            const tom = toDateEllerUndefined(k.tom)
                            return (
                                fom &&
                                tom &&
                                erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                            )
                        })
                        .map((k) =>
                            lagKlippPeriodeMedElement(
                                k,
                                aktivTidsvindu,
                                aktivPeriodeId,
                                aktivDrawerKildeId,
                                onPeriodeValgt,
                            ),
                        )
                        .filter((periode): periode is TidslinjePeriodeMedElement => periode !== null),
                )
        })

        if (perioderMedInnhold.length === 0) return []

        const spor = grupperPerioderISpor(perioderMedInnhold)

        return spor.map((perioderISpor, index) => (
            <Timeline.Row
                key={`sok-${arbId}-${index}`}
                label={index === 0 ? label : `${label} (overlapp)`}
                icon={<TasklistIcon aria-hidden fontSize="1.5rem" />}
            >
                {perioderISpor.map((periode) => periode.element)}
            </Timeline.Row>
        ))
    })
}
