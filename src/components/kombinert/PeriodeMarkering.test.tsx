import React from 'react'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'

import { Soknad } from '../../queryhooks/useSoknader'
import { mapTilSykmelding } from '../../queryhooks/useSykmeldinger'
import { sykmeldingerTestdata } from '../../testdata/sykmeldingerTestdata'
import { ArbeidsgiverGruppering } from '../../utils/gruppering'
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
})
