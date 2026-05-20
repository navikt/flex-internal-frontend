import React from 'react'
import { TasklistIcon } from '@navikt/aksel-icons'
import { Timeline } from '@navikt/ds-react'

import { ArbeidsgiverGruppering, SoknadGruppering } from '../../utils/gruppering'
import { dayjsToDate } from '../../queryhooks/useSoknader'
import { erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import { ikonParForSoknad, ikonerForSoknad, klippIkon } from '../../utils/tidslinjeIkonUtils'
import { sorterSoknadGrupperEtterSignaturDato } from '../../utils/kombinertTidslinjeSortering'
import { arbeidsgiverLabelForSoknader } from '../../utils/soknadArbeidsgiverLabel'
import { lagKlippetSoknadDrawerInnhold, lagSoknadDrawerInnhold } from '../DetaljerDrawer'
import ViktigeFeltForSoknad from '../periodeinfo/ViktigeFeltForSoknad'
import { timelinePeriodeStatus } from '../soknad/Tidslinje'

import type { OnPeriodeValgt } from './SykmeldingRader'

interface Props {
    soknaderGruppert: Map<string, ArbeidsgiverGruppering>
    aktivTidsvindu: { fra: Date; til: Date }
    aktivPeriodeId: string | null
    aktivDrawerKildeId: string | null
    onPeriodeValgt: OnPeriodeValgt
}

export const lagSoknadRader = ({
    soknaderGruppert,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
}: Props): React.ReactElement[] => {
    return sorterSoknadGrupperEtterSignaturDato(Array.from(soknaderGruppert.entries())).flatMap(([arbId, arb]) => {
        if (arbId === 'opphold_utland') return []

        const label = arbeidsgiverLabelForSoknader(arbId, arb, soknaderGruppert)

        const perioderMedInnhold = Array.from(arb.sykmeldinger.entries()).flatMap(([sykId, syk]) => {
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
                            const erValgtPeriode = aktivDrawerKildeId === kildeId

                            return (
                                <Timeline.Period
                                    start={dayjsToDate(k.fom)!}
                                    end={dayjsToDate(k.tom)!}
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
                            const erValgtPeriode = aktivDrawerKildeId === kildeId
                            klippingAvSoknad.push(
                                <Timeline.Period
                                    start={sokFom}
                                    end={sokTom}
                                    status={timelinePeriodeStatus(sok.soknad.status)}
                                    icon={ikonerForSoknad(sok.soknad)}
                                    key={sok.soknad.tom?.toISOString() ?? sok.soknad.id}
                                    isActive={erAktiv}
                                    className={erValgtPeriode ? 'shadow-[inset_0_0_0_4px_#dc2626]!' : undefined}
                                    onSelectPeriod={() => {
                                        if (aktivDrawerKildeId === kildeId) {
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
                            const erValgtPeriode = aktivDrawerKildeId === kildeId

                            return (
                                <Timeline.Period
                                    start={dayjsToDate(k.fom)!}
                                    end={dayjsToDate(k.tom)!}
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
                            )
                        }),
                )
        })

        if (perioderMedInnhold.length === 0) return []

        return [
            <Timeline.Row key={`sok-${arbId}`} label={label} icon={<TasklistIcon aria-hidden fontSize="1.5rem" />}>
                {perioderMedInnhold}
            </Timeline.Row>,
        ]
    })
}
