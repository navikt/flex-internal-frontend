import React from 'react'

import { antallKalenderdager, formaterDato } from '../sykmelding/sykmeldingTidslinjeUtils'
import type { PeriodeMedDatoer } from '../sykmelding/sykmeldingTidslinjeUtils'

import ViktigePeriodefelt from './ViktigePeriodefelt'

interface Props {
    perioder: PeriodeMedDatoer[]
}

export default function ViktigeFeltForSykmelding({ perioder }: Props) {
    const forstePeriode = perioder[0]
    const sistePeriode = perioder[perioder.length - 1]

    if (!forstePeriode || !sistePeriode) return null

    const viktigeFelt = [
        { etikett: 'Fra', verdi: formaterDato(forstePeriode.startDato) },
        { etikett: 'Til', verdi: formaterDato(sistePeriode.sluttDato) },
        { etikett: 'Antall delperioder', verdi: perioder.length },
        {
            etikett: 'Antall kalenderdager',
            verdi: antallKalenderdager(forstePeriode.startDato, sistePeriode.sluttDato),
        },
    ]

    const delperiodeTekster = perioder.map(
        (periode, indeks) =>
            `Periode ${indeks + 1}: ${formaterDato(periode.startDato)} – ${formaterDato(periode.sluttDato)}`,
    )

    return <ViktigePeriodefelt viktigeFelt={viktigeFelt} delperiodeTekster={delperiodeTekster} />
}
