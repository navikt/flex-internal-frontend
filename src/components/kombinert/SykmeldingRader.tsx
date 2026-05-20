import React from 'react'
import { StethoscopeIcon } from '@navikt/aksel-icons'
import { Timeline } from '@navikt/ds-react'

import { erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import { sorterSykmeldingGrupperEtterSignaturDato } from '../../utils/kombinertTidslinjeSortering'
import {
    ikonForSykmeldingPerioder,
    ikonParForSykmeldingPerioder,
    beskrivelseForSykmeldingPerioder,
} from '../../utils/tidslinjeIkonUtils'
import type { DrawerInnhold } from '../DetaljerDrawer'
import { lagSykmeldingDrawerInnhold } from '../DetaljerDrawer'
import ViktigeFeltForSykmelding from '../periodeinfo/ViktigeFeltForSykmelding'
import {
    perioderMedDatoer,
    sorterPerioder,
    sykmeldingStatus,
    SykmeldingerPerArbeidsgiver,
} from '../sykmelding/sykmeldingTidslinjeUtils'

export type OnPeriodeValgt = (periodeId: string | null, kildeId: string | null, drawer: DrawerInnhold | null) => void

interface Props {
    sykmeldingerGruppertPaArbeidsgiver: Map<string, SykmeldingerPerArbeidsgiver>
    aktivTidsvindu: { fra: Date; til: Date }
    aktivPeriodeId: string | null
    aktivDrawerKildeId: string | null
    onPeriodeValgt: OnPeriodeValgt
}

export const lagSykmeldingRader = ({
    sykmeldingerGruppertPaArbeidsgiver,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
}: Props): React.ReactElement[] => {
    return sorterSykmeldingGrupperEtterSignaturDato(Array.from(sykmeldingerGruppertPaArbeidsgiver.entries())).flatMap(
        ([arbeidsgiverId, arbeidsgiver]) => {
            const perioderMedInnhold = arbeidsgiver.sykmeldinger.flatMap((sykmelding) => {
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

                const forstePeriodetype = sykmelding.sykmeldingsperioder[0]?.type
                const arbeidssituasjon = sykmelding.sykmeldingStatus?.brukerSvar?.arbeidssituasjon?.svar
                const ikon = ikonForSykmeldingPerioder(perioder.length, forstePeriodetype, arbeidssituasjon)
                const periodeKey = `${sykmelding.id}-${forstePeriode.fom}-${sistePeriode.tom}`
                const periodeInfo = <ViktigeFeltForSykmelding sykmelding={sykmelding} perioder={perioder} />
                const sykmeldingAktivId = sykmelding.id
                const ikonHeader = ikonParForSykmeldingPerioder(perioder.length, forstePeriodetype, arbeidssituasjon)

                const erValgtPeriode = aktivDrawerKildeId === sykmeldingAktivId

                return [
                    <Timeline.Period
                        start={forstePeriode.startDato}
                        end={sistePeriode.sluttDato}
                        status={status}
                        icon={ikon}
                        className={erValgtPeriode ? 'ring-2 ring-red-600' : 'ring-1 ring-inset ring-white/95'}
                        key={periodeKey}
                        isActive={aktivPeriodeId === sykmeldingAktivId}
                        onSelectPeriod={() => {
                            if (aktivDrawerKildeId === sykmeldingAktivId) {
                                onPeriodeValgt(null, null, null)
                            } else {
                                onPeriodeValgt(
                                    sykmeldingAktivId,
                                    sykmeldingAktivId,
                                    lagSykmeldingDrawerInnhold(sykmelding, periodeInfo, ikonHeader),
                                )
                            }
                        }}
                    />,
                ]
            })

            if (perioderMedInnhold.length === 0) return []

            return [
                <Timeline.Row
                    key={`syk-${arbeidsgiverId}`}
                    label={arbeidsgiver.label}
                    icon={<StethoscopeIcon aria-hidden fontSize="1.5rem" />}
                >
                    {perioderMedInnhold}
                </Timeline.Row>,
            ]
        },
    )
}
