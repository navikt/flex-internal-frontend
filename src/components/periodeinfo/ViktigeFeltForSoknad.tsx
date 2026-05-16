import React from 'react'

import { Soknad, dayjsToDate } from '../../queryhooks/useSoknader'
import { antallKalenderdager, formaterDato } from '../sykmelding/sykmeldingTidslinjeUtils'

import ViktigePeriodefelt from './ViktigePeriodefelt'

interface Props {
    soknad: Soknad
}

const statusTekst: Record<string, string> = {
    NY: 'Ny',
    SENDT: 'Sendt',
    FREMTIDIG: 'Fremtidig',
    UTKAST_TIL_KORRIGERING: 'Utkast til korrigering',
    KORRIGERT: 'Korrigert',
    AVBRUTT: 'Avbrutt',
    SLETTET: 'Slettet',
    UTGAATT: 'Utgått',
}

const arbeidssituasjonTekst: Record<string, string> = {
    NAERINGSDRIVENDE: 'Næringsdrivende',
    FRILANSER: 'Frilanser',
    ARBEIDSTAKER: 'Arbeidstaker',
    ARBEIDSLEDIG: 'Arbeidsledig',
    ANNET: 'Annet',
}

const hentGradFraSoknadperioder = (soknad: Soknad): string => {
    const grader = soknad.soknadPerioder
        .map((p) => p.grad)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => b - a)

    return grader.length > 0 ? grader.map((g) => `${g}%`).join(', ') : 'Ikke satt'
}

export default function ViktigeFeltForSoknad({ soknad }: Props) {
    if (soknad.soknadstype === 'OPPHOLD_UTLAND') {
        const opprettetDato = dayjsToDate(soknad.opprettetDato)
        if (!opprettetDato) return null

        const viktigeFelt = [
            { etikett: 'ID', verdi: soknad.id },
            { etikett: 'Status', verdi: statusTekst[soknad.status] || soknad.status },
            { etikett: 'Opprettet dato', verdi: formaterDato(opprettetDato) },
        ]

        return <ViktigePeriodefelt viktigeFelt={viktigeFelt} />
    }

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
        { etikett: 'ID', verdi: soknad.id },
        ...(soknad.sykmeldingId ? [{ etikett: 'Sykmelding ID', verdi: soknad.sykmeldingId }] : []),
        { etikett: 'Status', verdi: statusTekst[soknad.status] || soknad.status },
        {
            etikett: 'Arbeidssituasjon',
            verdi: soknad.arbeidssituasjon
                ? arbeidssituasjonTekst[soknad.arbeidssituasjon] || soknad.arbeidssituasjon
                : 'Ikke satt',
        },
        { etikett: 'Grad', verdi: hentGradFraSoknadperioder(soknad) },
        { etikett: 'Ventetid', verdi: soknad.ventetidSykmeldingUuid ? 'Ja' : 'Nei' },
        ...(soknad.ventetidSykmeldingUuid
            ? [{ etikett: 'Ventetid sykmelding ID', verdi: soknad.ventetidSykmeldingUuid }]
            : []),
        { etikett: 'Fra', verdi: formaterDato(forstePeriode) },
        { etikett: 'Til', verdi: formaterDato(sistePeriode) },
        { etikett: 'Antall kalenderdager', verdi: antallKalenderdager(forstePeriode, sistePeriode) },
    ]

    const delperiodeTekster = perioder.map(
        (periode, indeks) => `${indeks + 1}: ${formaterDato(periode.startDato)} – ${formaterDato(periode.sluttDato)}`,
    )

    return <ViktigePeriodefelt viktigeFelt={viktigeFelt} delperiodeTekster={delperiodeTekster} />
}
