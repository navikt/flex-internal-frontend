import { describe, expect, it } from 'vitest'

import {
    BackendKlippetSykepengesoknadRecord,
    BackendSoknad,
    KlippetSykepengesoknadRecord,
    Soknad,
} from '../queryhooks/useSoknader'

import gruppertOgFiltrert, { SykmeldingGruppering } from './gruppering'
import { sortert } from './soknadSortering'

const lagSoknad = (overstyringer: Partial<BackendSoknad>): Soknad =>
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

const lagKlipp = (overstyringer: Partial<BackendKlippetSykepengesoknadRecord> = {}): KlippetSykepengesoknadRecord =>
    new KlippetSykepengesoknadRecord({
        id: 'klipp-1',
        sykepengesoknadUuid: 'soknad-klippet',
        sykmeldingUuid: 'sykmelding-klippet',
        klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_ETTER',
        periodeFor: [{ fom: '2026-02-01', tom: '2026-02-10', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
        periodeEtter: null,
        ...overstyringer,
    } as unknown as BackendKlippetSykepengesoknadRecord)

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

    it('viser klippehistorikk sammen med erstatningssøknad som har annen UUID', () => {
        // Søknad "soknad-gammel" ble fullstendig klippet, og erstattet av "soknad-ny" med annen UUID
        const erstatningsSoknad = lagSoknad({
            id: 'soknad-ny',
            sykmeldingId: 'sykmelding-felles',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '999999999',
            fom: '2026-02-01',
            tom: '2026-02-10',
            soknadPerioder: [
                { fom: '2026-02-01', tom: '2026-02-10', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' },
            ],
        })
        const klippForGammelSoknad = lagKlipp({
            sykepengesoknadUuid: 'soknad-gammel',
            sykmeldingUuid: 'sykmelding-felles',
            periodeFor: [{ fom: '2026-02-01', tom: '2026-02-10', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
            periodeEtter: null,
        })

        const gruppert = gruppertOgFiltrert([], [erstatningsSoknad], [klippForGammelSoknad])

        // Skal IKKE opprette ghost — erstatningssøknaden dekker samme sykmelding
        const nøkler = Array.from(gruppert.keys())
        expect(nøkler).toContain('999999999')
        expect(nøkler.some((n) => n.endsWith('_GHOST'))).toBe(false)

        // Erstatningssøknaden skal vises under riktig arbeidsgiver
        const arbeidsgiver = gruppert.get('999999999')!
        const sykmeldinger = Array.from(arbeidsgiver.sykmeldinger.entries())
        expect(sykmeldinger).toHaveLength(1)

        const [, sykmelding] = sykmeldinger[0]
        const soknader = Array.from(sykmelding.soknader.values())
        expect(soknader).toHaveLength(1)
        expect(soknader[0].soknad.id).toBe('soknad-ny')

        // Klippehistorikken skal være på sykmeldingsnivå
        expect(sykmelding.klippingAvSykmelding.length).toBeGreaterThan(0)
    })

    it('viser klippehistorikk på original sykmelding når ny overlappende sykmelding forårsaket klippet', () => {
        // Realistisk scenario: ny sykmelding overlapper → original søknad klippes.
        // Erstatningssøknaden hører til den NYE sykmeldingen, men klippet refererer til den ORIGINALE.
        const juniSoknad = lagSoknad({
            id: 'soknad-juni',
            sykmeldingId: 'sykmelding-original',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '999999999',
            fom: '2026-06-01',
            tom: '2026-06-30',
            soknadPerioder: [
                { fom: '2026-06-01', tom: '2026-06-30', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' },
            ],
        })
        const erstatningsSoknadNySykmelding = lagSoknad({
            id: 'soknad-ny-sykmelding',
            sykmeldingId: 'sykmelding-overlappende',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '999999999',
            fom: '2026-07-01',
            tom: '2026-07-31',
            soknadPerioder: [{ fom: '2026-07-01', tom: '2026-07-31', grad: 50, sykmeldingstype: 'GRADERT' }],
        })
        const klippAvOriginal = lagKlipp({
            sykepengesoknadUuid: 'soknad-gammel-juliaug',
            sykmeldingUuid: 'sykmelding-original',
            periodeFor: [{ fom: '2026-07-01', tom: '2026-08-15', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
            periodeEtter: null,
        })

        const gruppert = gruppertOgFiltrert([], [juniSoknad, erstatningsSoknadNySykmelding], [klippAvOriginal])

        // Ingen ghost
        const alleNøkler = Array.from(gruppert.keys())
        expect(alleNøkler.some((n) => n.includes('_GHOST'))).toBe(false)

        // Klippehistorikken skal ligge på original sykmelding (sammen med juni-søknaden).
        // Fordi klipperioden overlapper med erstatningssøknaden havner de i ulike arbeidsgivergrupper.
        const originalArbeidsgiver = Array.from(gruppert.entries()).find(([, ag]) =>
            ag.sykmeldinger.has('sykmelding-original'),
        )!
        const originalSykmelding = originalArbeidsgiver[1].sykmeldinger.get('sykmelding-original')!
        expect(originalSykmelding.klippingAvSykmelding.length).toBeGreaterThan(0)

        // Erstatningssøknaden skal finnes (på sin egen sykmelding)
        const overlAppendeArbeidsgiver = Array.from(gruppert.entries()).find(([, ag]) =>
            ag.sykmeldinger.has('sykmelding-overlappende'),
        )!
        const overlappendeSykmelding = overlAppendeArbeidsgiver[1].sykmeldinger.get('sykmelding-overlappende')!
        const soknader = Array.from(overlappendeSykmelding.soknader.values())
        expect(soknader).toHaveLength(1)
        expect(soknader[0].soknad.id).toBe('soknad-ny-sykmelding')
    })
})

describe('sortert', () => {
    it('sorterer synkende pa tom for dayjs-verdier', () => {
        const tidligSoknad = lagSoknad({ id: 'tidlig', sykmeldingId: 'syk-tidlig', tom: '2026-01-10' })
        const senSoknad = lagSoknad({ id: 'sen', sykmeldingId: 'syk-sen', tom: '2026-01-20' })

        const tidlig: [string, SykmeldingGruppering] = [
            'syk-tidlig',
            {
                soknader: new Map([[tidligSoknad.id, { soknad: tidligSoknad, klippingAvSoknad: [] }]]),
                klippingAvSykmelding: [],
            },
        ]

        const sen: [string, SykmeldingGruppering] = [
            'syk-sen',
            {
                soknader: new Map([[senSoknad.id, { soknad: senSoknad, klippingAvSoknad: [] }]]),
                klippingAvSykmelding: [],
            },
        ]

        expect(sortert(sen, tidlig, 'tom')).toBe(-1)
        expect(sortert(tidlig, sen, 'tom')).toBe(1)
    })
})
