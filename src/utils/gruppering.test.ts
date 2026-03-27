import { describe, expect, it } from 'vitest'

import {
    KlippetSykepengesoknadRecord,
    RSKlippetSykepengesoknadRecord,
    RSSoknad,
    Soknad,
} from '../queryhooks/useSoknader'

import gruppertOgFiltrert from './gruppering'

const lagSoknad = (overstyringer: Partial<RSSoknad>): Soknad =>
    new Soknad({
        id: 'soknad-1',
        sykmeldingId: 'sykmelding-1',
        soknadstype: 'SELVSTENDIGE_OG_FRILANSERE',
        status: 'SENDT',
        arbeidssituasjon: 'NAERINGSDRIVENDE',
        fom: '2026-01-01',
        tom: '2026-01-31',
        soknadPerioder: [{ fom: '2026-01-01', tom: '2026-01-31', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
        ...overstyringer,
    })

const lagKlipp = (overstyringer: Partial<RSKlippetSykepengesoknadRecord> = {}): KlippetSykepengesoknadRecord =>
    new KlippetSykepengesoknadRecord({
        id: 'klipp-1',
        sykepengesoknadUuid: 'soknad-klippet',
        sykmeldingUuid: 'sykmelding-klippet',
        klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_ETTER',
        periodeFor: [{ fom: '2026-02-01', tom: '2026-02-10', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
        periodeEtter: null,
        ...overstyringer,
    } as unknown as RSKlippetSykepengesoknadRecord)

describe('gruppertOgFiltrert', () => {
    it('grupperer næringsdrivende separat fra klippet ghost-søknad', () => {
        const naeringsdrivendeSoknad = lagSoknad({
            id: 'soknad-naering',
            sykmeldingId: 'sykmelding-naering',
            arbeidsgiverOrgnummer: undefined,
            arbeidssituasjon: 'NAERINGSDRIVENDE',
            fom: '2026-01-01',
            tom: '2026-01-10',
        })
        const klipp = lagKlipp({
            sykepengesoknadUuid: 'soknad-klippet-ghost',
            sykmeldingUuid: 'sykmelding-klippet-ghost',
        })

        const gruppert = gruppertOgFiltrert([], [naeringsdrivendeSoknad], [klipp])
        const nøkler = Array.from(gruppert.keys())

        expect(nøkler).toContain('naeringsdrivende')
        expect(nøkler).toContain('arbeidsgiver_GHOST')
    })

    it('plasserer ren klippet søknad i ghost-gruppe', () => {
        const gruppert = gruppertOgFiltrert([], [], [lagKlipp()])
        const nøkler = Array.from(gruppert.keys())

        expect(nøkler.some((nøkkel) => nøkkel.startsWith('naeringsdrivende'))).toBe(false)
        expect(nøkler.some((nøkkel) => nøkkel.startsWith('arbeidsgiver_GHOST'))).toBe(true)
    })
})
