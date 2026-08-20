import React from 'react'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'

import { Soknad } from '../../queryhooks/useSoknader'
import { mapTilSykmelding } from '../../queryhooks/useSykmeldinger'
import { sykmeldingerTestdata } from '../../testdata/sykmeldingerTestdata'
import { ArbeidsgiverGruppering } from '../../utils/gruppering'
import { Klipp } from '../../utils/overlapp'
import { SykmeldingerPerArbeidsgiver } from '../sykmelding/sykmeldingTidslinjeUtils'

import { lagSoknadRader } from './SoknadRader'
import { lagSykmeldingRader } from './SykmeldingRader'

const aktivTidsvindu = {
    fra: new Date(Date.UTC(2026, 0, 1)),
    til: new Date(Date.UTC(2026, 11, 31)),
}

const onPeriodeValgt = vi.fn()

interface PeriodProps {
    className?: string
    children?: React.ReactNode
}

const hentForstePeriodeFraRader = (rader: React.ReactElement[]) => {
    const forsteRad = rader[0] as React.ReactElement<PeriodProps>
    const perioder = React.Children.toArray(forsteRad.props.children) as React.ReactElement<PeriodProps>[]
    return perioder[0]
}

const hentPerioderFraForsteRad = (rader: React.ReactElement[]) => {
    const forsteRad = rader[0] as React.ReactElement<PeriodProps>
    return React.Children.toArray(forsteRad.props.children) as React.ReactElement<PeriodProps>[]
}

describe('PeriodeMarkering', () => {
    it('markerer valgt sykmeldingsperiode med tydelig rød shadow-klasse', () => {
        const sykmelding = mapTilSykmelding(sykmeldingerTestdata[0])
        const sykmeldingerGruppertPaArbeidsgiver = new Map<string, SykmeldingerPerArbeidsgiver>([
            [
                'arbeidsgiver-1',
                {
                    label: 'Arbeidsgiver',
                    sykmeldinger: [sykmelding],
                    dagNokler: new Set<string>(),
                },
            ],
        ])

        const rader = lagSykmeldingRader({
            sykmeldingerGruppertPaArbeidsgiver,
            aktivTidsvindu,
            aktivPeriodeId: sykmelding.id,
            aktivDrawerKildeId: sykmelding.id,
            onPeriodeValgt,
        })

        const periode = hentForstePeriodeFraRader(rader)
        expect(periode.props.className).toContain('shadow-[inset_0_0_0_4px_#dc2626]!')
    })

    it('markerer valgt søknadsperiode med tydelig rød shadow-klasse', () => {
        const soknad = new Soknad({
            id: 'soknad-1',
            sykmeldingId: 'sykmelding-1',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '123456789',
            arbeidsgiverNavn: 'Arbeidsgiver',
            fom: '2026-03-01',
            tom: '2026-03-15',
            sykmeldingSignaturDato: '2026-02-28',
            opprettetDato: '2026-03-16T10:00:00',
            soknadPerioder: [],
        })

        const soknaderGruppert = new Map<string, ArbeidsgiverGruppering>([
            [
                '123456789',
                {
                    sykmeldinger: new Map([
                        [
                            'sykmelding-1',
                            {
                                soknader: new Map([
                                    [
                                        soknad.id,
                                        {
                                            soknad,
                                            klippingAvSoknad: [],
                                        },
                                    ],
                                ]),
                                klippingAvSykmelding: [],
                            },
                        ],
                    ]),
                },
            ],
        ])

        const rader = lagSoknadRader({
            soknaderGruppert,
            aktivTidsvindu,
            aktivPeriodeId: 'sykmelding-1',
            aktivDrawerKildeId: soknad.id,
            onPeriodeValgt,
        })

        const periode = hentForstePeriodeFraRader(rader)
        expect(periode.props.className).toContain('shadow-[inset_0_0_0_4px_#dc2626]!')
    })

    it('beholder standard sykmelding-border når perioden ikke er valgt', () => {
        const sykmelding = mapTilSykmelding(sykmeldingerTestdata[1])
        const sykmeldingerGruppertPaArbeidsgiver = new Map<string, SykmeldingerPerArbeidsgiver>([
            [
                'arbeidsgiver-1',
                {
                    label: 'Arbeidsgiver',
                    sykmeldinger: [{ ...sykmelding, signaturDato: dayjs('2026-01-28') }],
                    dagNokler: new Set<string>(),
                },
            ],
        ])

        const rader = lagSykmeldingRader({
            sykmeldingerGruppertPaArbeidsgiver,
            aktivTidsvindu,
            aktivPeriodeId: null,
            aktivDrawerKildeId: null,
            onPeriodeValgt,
        })

        const periode = hentForstePeriodeFraRader(rader)
        expect(periode.props.className).toContain('ring-1 ring-inset ring-white/95')
    })

    it('bruker unike keys for søknader med samme tom-dato', () => {
        const soknad1 = new Soknad({
            id: 'soknad-1',
            sykmeldingId: 'sykmelding-1',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '123456789',
            arbeidsgiverNavn: 'Arbeidsgiver',
            fom: '2026-07-01',
            tom: '2026-07-26',
            soknadPerioder: [],
        })
        const soknad2 = new Soknad({
            id: 'soknad-2',
            sykmeldingId: 'sykmelding-2',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '123456789',
            arbeidsgiverNavn: 'Arbeidsgiver',
            fom: '2026-06-29',
            tom: '2026-07-26',
            soknadPerioder: [],
        })

        const soknaderGruppert = new Map<string, ArbeidsgiverGruppering>([
            [
                '123456789',
                {
                    sykmeldinger: new Map([
                        [
                            'sykmelding-1',
                            {
                                soknader: new Map([
                                    [soknad1.id, { soknad: soknad1, klippingAvSoknad: [] }],
                                    [soknad2.id, { soknad: soknad2, klippingAvSoknad: [] }],
                                ]),
                                klippingAvSykmelding: [],
                            },
                        ],
                    ]),
                },
            ],
        ])

        const rader = lagSoknadRader({
            soknaderGruppert,
            aktivTidsvindu,
            aktivPeriodeId: null,
            aktivDrawerKildeId: null,
            onPeriodeValgt,
        })

        const perioder = hentPerioderFraForsteRad(rader)
        const keys = perioder.map((periode) => periode.key)

        expect(keys.some((key) => String(key).includes('soknad-1'))).toBe(true)
        expect(keys.some((key) => String(key).includes('soknad-2'))).toBe(true)
        expect(new Set(keys).size).toBe(keys.length)
    })

    it('viser både klippet del og ordinær periode for delvis klippet søknad', () => {
        const soknad = new Soknad({
            id: 'soknad-delvis-klipp',
            sykmeldingId: 'sykmelding-delvis-klipp',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            arbeidssituasjon: 'ARBEIDSTAKER',
            arbeidsgiverOrgnummer: '123456789',
            arbeidsgiverNavn: 'Arbeidsgiver',
            fom: '2026-07-10',
            tom: '2026-07-26',
            soknadPerioder: [],
        })

        const klippetDel: Klipp = {
            id: 'klipp-1',
            sykepengesoknadUuid: soknad.id,
            sykmeldingUuid: 'sykmelding-delvis-klipp',
            klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_INNI',
            periodeFor: [],
            periodeEtter: [],
            fom: '2026-07-01',
            tom: '2026-07-09',
        }

        const soknaderGruppert = new Map<string, ArbeidsgiverGruppering>([
            [
                '123456789',
                {
                    sykmeldinger: new Map([
                        [
                            'sykmelding-delvis-klipp',
                            {
                                soknader: new Map([
                                    [
                                        soknad.id,
                                        {
                                            soknad,
                                            klippingAvSoknad: [klippetDel],
                                        },
                                    ],
                                ]),
                                klippingAvSykmelding: [],
                            },
                        ],
                    ]),
                },
            ],
        ])

        const rader = lagSoknadRader({
            soknaderGruppert,
            aktivTidsvindu,
            aktivPeriodeId: null,
            aktivDrawerKildeId: null,
            onPeriodeValgt,
        })

        const perioder = hentPerioderFraForsteRad(rader)
        const keys = perioder.map((periode) => String(periode.key))

        expect(perioder).toHaveLength(2)
        expect(keys.some((key) => key.includes('klipp-1'))).toBe(true)
        expect(keys.some((key) => key.includes('soknad-delvis-klipp'))).toBe(true)
    })
})
