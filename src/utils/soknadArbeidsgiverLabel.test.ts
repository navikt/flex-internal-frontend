import { describe, expect, it } from 'vitest'

import {
    KlippetSykepengesoknadRecord,
    RSKlippetSykepengesoknadRecord,
    RSSoknad,
    Soknad,
} from '../queryhooks/useSoknader'

import { Klipp } from './overlapp'
import { ArbeidsgiverGruppering, SoknadGruppering, SykmeldingGruppering } from './gruppering'
import { arbeidsgiverLabelForSoknader } from './soknadArbeidsgiverLabel'

const lagSoknad = (overstyringer: Partial<RSSoknad>): Soknad =>
    new Soknad({
        id: 'soknad-1',
        sykmeldingId: 'sykmelding-1',
        soknadstype: 'ARBEIDSTAKERE',
        status: 'SENDT',
        arbeidssituasjon: 'ARBEIDSTAKER',
        fom: '2026-01-01',
        tom: '2026-01-31',
        arbeidsgiverOrgnummer: undefined,
        soknadPerioder: [{ fom: '2026-01-01', tom: '2026-01-31', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
        ...overstyringer,
    })

const lagKlipp = (klippVariant: RSKlippetSykepengesoknadRecord['klippVariant']): Klipp => ({
    ...new KlippetSykepengesoknadRecord({
        id: 'klipp-1',
        sykepengesoknadUuid: 'soknad-klippet',
        sykmeldingUuid: 'sykmelding-1',
        klippVariant,
        periodeFor: [{ fom: '2026-01-01', tom: '2026-01-31', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
        periodeEtter: [],
    }),
    fom: '2026-01-01',
    tom: '2026-01-31',
})

const lagSoknadGruppering = (soknad: Soknad, klippAvSoknad: Klipp[] = []): SoknadGruppering => ({
    soknad,
    klippingAvSoknad: klippAvSoknad,
})

const lagSykmeldingGruppering = (soknader: SoknadGruppering[]): SykmeldingGruppering => ({
    soknader: new Map(soknader.map((soknadGruppering) => [soknadGruppering.soknad.id, soknadGruppering])),
    klippingAvSykmelding: [],
})

const lagArbeidsgiverGruppering = (sykmeldinger: Array<[string, SykmeldingGruppering]>): ArbeidsgiverGruppering => ({
    sykmeldinger: new Map(sykmeldinger),
})

describe('arbeidsgiverLabelForSoknader', () => {
    it('viser orgnummer med saks ved klippstatus SOKNAD_STARTER_FOR_SLUTTER_ETTER', () => {
        const ghostGruppe = lagArbeidsgiverGruppering([
            [
                'sykmelding-1_GHOST',
                lagSykmeldingGruppering([
                    lagSoknadGruppering(lagSoknad({ id: 'ghost-soknad' }), [
                        lagKlipp('SOKNAD_STARTER_FOR_SLUTTER_ETTER'),
                    ]),
                ]),
            ],
        ])

        const arbeidsgiverMedOrgnummer = lagArbeidsgiverGruppering([
            [
                'sykmelding-1',
                lagSykmeldingGruppering([
                    lagSoknadGruppering(
                        lagSoknad({
                            id: 'soknad-med-org',
                            arbeidsgiverOrgnummer: '999888777',
                            sykmeldingId: 'sykmelding-1',
                        }),
                    ),
                ]),
            ],
        ])

        const soknaderGruppertPaArbeidsgiver = new Map<string, ArbeidsgiverGruppering>([
            ['arbeidsgiver_GHOST', ghostGruppe],
            ['999888777', arbeidsgiverMedOrgnummer],
        ])

        expect(arbeidsgiverLabelForSoknader('arbeidsgiver_GHOST', ghostGruppe, soknaderGruppertPaArbeidsgiver)).toBe(
            '999888777 ✂️',
        )
    })

    it('viser Næringsdrivende når arbeidssituasjon er NAERINGSDRIVENDE', () => {
        const naeringsdrivendeGruppe = lagArbeidsgiverGruppering([
            [
                'sykmelding-naering',
                lagSykmeldingGruppering([
                    lagSoknadGruppering(
                        lagSoknad({
                            id: 'naering',
                            arbeidssituasjon: 'NAERINGSDRIVENDE',
                            soknadstype: 'SELVSTENDIGE_OG_FRILANSERE',
                        }),
                    ),
                ]),
            ],
        ])

        const soknaderGruppertPaArbeidsgiver = new Map<string, ArbeidsgiverGruppering>([
            ['naeringsdrivende', naeringsdrivendeGruppe],
        ])

        expect(
            arbeidsgiverLabelForSoknader('naeringsdrivende', naeringsdrivendeGruppe, soknaderGruppertPaArbeidsgiver),
        ).toBe('Næringsdrivende')
    })

    it('faller tilbake til Arbeidsgiver 👻 når orgnummer ikke finnes', () => {
        const ghostGruppe = lagArbeidsgiverGruppering([
            [
                'sykmelding-uten-org_GHOST',
                lagSykmeldingGruppering([
                    lagSoknadGruppering(lagSoknad({ id: 'ghost-soknad' }), [
                        lagKlipp('SOKNAD_STARTER_FOR_SLUTTER_ETTER'),
                    ]),
                ]),
            ],
        ])

        const soknaderGruppertPaArbeidsgiver = new Map<string, ArbeidsgiverGruppering>([
            ['arbeidsgiver_GHOST', ghostGruppe],
        ])

        expect(arbeidsgiverLabelForSoknader('arbeidsgiver_GHOST', ghostGruppe, soknaderGruppertPaArbeidsgiver)).toBe(
            'Arbeidsgiver 👻',
        )
    })
})
