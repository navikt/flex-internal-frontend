import React from 'react'

import { Soknad, dayjsToDate } from '../../queryhooks/useSoknader'
import { antallKalenderdager, formaterDato } from '../sykmelding/sykmeldingTidslinjeUtils'

import ViktigePeriodefelt from './ViktigePeriodefelt'

interface Props {
    soknad: Soknad
}

export default function ViktigeFeltForSoknad({ soknad }: Props) {
    const perioder = soknad.soknadPerioder
        .map((periode) => {
            if (!periode.fom.isValid() || !periode.tom.isValid()) return null
            return {
                startDato: periode.fom.toDate(),
                sluttDato: periode.tom.toDate(),
            }
        })
        .filter((periode): periode is { startDato: Date; sluttDato: Date } => periode !== null)
        .sort((a, b) => a.startDato.getTime() - b.startDato.getTime())

    const forstePeriode = dayjsToDate(soknad.fom) ?? perioder[0]?.startDato
    const sistePeriode = dayjsToDate(soknad.tom) ?? perioder[perioder.length - 1]?.sluttDato

    if (!forstePeriode || !sistePeriode) return null

    const viktigeFelt = [
        { etikett: 'Fra', verdi: formaterDato(forstePeriode) },
        { etikett: 'Til', verdi: formaterDato(sistePeriode) },
        { etikett: 'Antall delperioder', verdi: perioder.length },
        { etikett: 'Antall kalenderdager', verdi: antallKalenderdager(forstePeriode, sistePeriode) },
    ]

    const delperiodeTekster = perioder.map(
        (periode, indeks) =>
            `Periode ${indeks + 1}: ${formaterDato(periode.startDato)} – ${formaterDato(periode.sluttDato)}`,
    )

    return <ViktigePeriodefelt viktigeFelt={viktigeFelt} delperiodeTekster={delperiodeTekster} />
}
