import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'

import { Soknad } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'
import type { SykmeldingerPerArbeidsgiver } from '../components/sykmelding/sykmeldingTidslinjeUtils'

import type { ArbeidsgiverGruppering } from './gruppering'
import {
    sorterSykmeldingGrupperEtterSignaturDato,
    sorterSoknadGrupperEtterSignaturDato,
} from './kombinertTidslinjeSortering'

const lagSykGruppe = (id: string, signaturDato: string | null): [string, SykmeldingerPerArbeidsgiver] => [
    id,
    {
        label: id,
        dagNokler: new Set(),
        sykmeldinger: [{ signaturDato: signaturDato ? dayjs(signaturDato) : undefined } as unknown as Sykmelding],
    },
]

const lagSokGruppe = (id: string, sykmeldingSignaturDato: string | null): [string, ArbeidsgiverGruppering] => {
    const soknad = new Soknad({
        id: `soknad-${id}`,
        soknadstype: 'SELVSTENDIGE_OG_FRILANSERE',
        status: 'SENDT',
        soknadPerioder: [],
        sykmeldingSignaturDato: sykmeldingSignaturDato ?? undefined,
    })
    return [
        id,
        {
            sykmeldinger: new Map([
                [
                    `sykmelding-${id}`,
                    {
                        soknader: new Map([[soknad.id, { soknad, klippingAvSoknad: [] }]]),
                        klippingAvSykmelding: [],
                    },
                ],
            ]),
        },
    ]
}

describe('sorterSykmeldingGrupperEtterSignaturDato', () => {
    it('sorterer nyeste signaturDato øverst', () => {
        const entries = [lagSykGruppe('gammel', '2026-01-01'), lagSykGruppe('ny', '2026-03-01')]

        const resultat = sorterSykmeldingGrupperEtterSignaturDato(entries)

        expect(resultat[0][0]).toBe('ny')
        expect(resultat[1][0]).toBe('gammel')
    })

    it('plasserer gruppe uten signaturDato sist', () => {
        const entries = [lagSykGruppe('uten-dato', null), lagSykGruppe('med-dato', '2026-02-01')]

        const resultat = sorterSykmeldingGrupperEtterSignaturDato(entries)

        expect(resultat[0][0]).toBe('med-dato')
        expect(resultat[1][0]).toBe('uten-dato')
    })

    it('returnerer tom liste uendret', () => {
        expect(sorterSykmeldingGrupperEtterSignaturDato([])).toEqual([])
    })
})

describe('sorterSoknadGrupperEtterSignaturDato', () => {
    it('sorterer nyeste sykmeldingSignaturDato øverst', () => {
        const entries = [lagSokGruppe('gammel', '2026-01-01'), lagSokGruppe('ny', '2026-03-01')]

        const resultat = sorterSoknadGrupperEtterSignaturDato(entries)

        expect(resultat[0][0]).toBe('ny')
        expect(resultat[1][0]).toBe('gammel')
    })

    it('plasserer gruppe uten sykmeldingSignaturDato sist', () => {
        const entries = [lagSokGruppe('uten-dato', null), lagSokGruppe('med-dato', '2026-02-01')]

        const resultat = sorterSoknadGrupperEtterSignaturDato(entries)

        expect(resultat[0][0]).toBe('med-dato')
        expect(resultat[1][0]).toBe('uten-dato')
    })

    it('returnerer tom liste uendret', () => {
        expect(sorterSoknadGrupperEtterSignaturDato([])).toEqual([])
    })
})
