import React from 'react'

import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { antallKalenderdager, formaterDato } from '../sykmelding/sykmeldingTidslinjeUtils'
import type { PeriodeMedDatoer } from '../sykmelding/sykmeldingTidslinjeUtils'

import ViktigePeriodefelt from './ViktigePeriodefelt'

interface Props {
    sykmelding: Sykmelding
    perioder: PeriodeMedDatoer[]
}

const statusTekst: Record<string, string> = {
    NY: 'Ny',
    APEN: 'Åpen',
    SENDT: 'Sendt',
    AVVIST: 'Avvist',
    UTGATT: 'Utgått',
    BEKREFTET: 'Bekreftet',
    AVBRUTT: 'Avbrutt',
}

const hentGradFraSykmelding = (sykmelding: Sykmelding): string => {
    const grader = sykmelding.sykmeldingsperioder
        .flatMap((periode) => {
            if (periode.gradert?.grad) return `${periode.gradert.grad}%`
            if (periode.behandlingsdager) return `Behandlingsdager (${periode.behandlingsdager})`
            if (periode.type === 'AKTIVITET_IKKE_MULIG') return '100%'
            if (periode.type === 'AVVENTENDE') return 'Avventende'
            if (periode.type === 'REISETILSKUDD') return 'Reisetilskudd'
            return '100%'
        })
        .filter((v, i, a) => a.indexOf(v) === i)

    return grader.length > 0 ? grader.join(', ') : 'Ikke satt'
}

export default function ViktigeFeltForSykmelding({ sykmelding, perioder }: Props) {
    const forstePeriode = perioder[0]
    const sistePeriode = perioder[perioder.length - 1]

    if (!forstePeriode || !sistePeriode) return null

    const viktigeFelt = [
        { etikett: 'ID', verdi: sykmelding.id },
        {
            etikett: 'Status',
            verdi: statusTekst[sykmelding.sykmeldingStatus.statusEvent] || sykmelding.sykmeldingStatus.statusEvent,
        },
        {
            etikett: 'Signatur dato',
            verdi: sykmelding.signaturDato ? formaterDato(sykmelding.signaturDato.toDate()) : 'Ikke satt',
        },
        { etikett: 'Grad', verdi: hentGradFraSykmelding(sykmelding) },
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
