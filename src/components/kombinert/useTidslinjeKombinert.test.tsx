import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { Soknad } from '../../queryhooks/useSoknader'
import { mapTilSykmelding } from '../../queryhooks/useSykmeldinger'
import { sykmeldingerTestdata } from '../../testdata/sykmeldingerTestdata'
import type { KlippetSykepengesoknadRecord } from '../../queryhooks/useSoknader'

import { useTidslinjeKombinert } from './useTidslinjeKombinert'

const lagSykmelding = () => {
    const backendSykmelding = structuredClone(sykmeldingerTestdata[0])
    backendSykmelding.sykmeldingsperioder = [
        {
            fom: '2026-01-01',
            tom: '2026-01-31',
            gradert: null,
            behandlingsdager: null,
            innspillTilArbeidsgiver: null,
            type: 'AKTIVITET_IKKE_MULIG',
            reisetilskudd: false,
            aktivitetIkkeMulig: null,
        },
    ]

    return mapTilSykmelding(backendSykmelding)
}

const lagSoknad = (sykmeldingId: string) =>
    new Soknad({
        id: 'soknad-1',
        sykmeldingId,
        soknadstype: 'ARBEIDSTAKERE',
        status: 'SENDT',
        arbeidssituasjon: 'ARBEIDSTAKER',
        fom: '2026-01-01',
        tom: '2026-03-31',
        opprettetDato: '2026-03-31T12:00:00',
        sykmeldingSignaturDato: '2026-01-31',
        soknadPerioder: [],
    })

const ingenKlipp: KlippetSykepengesoknadRecord[] = []

describe('useTidslinjeKombinert', () => {
    it('bruker maksimal tom fra sykmeldinger selv om søknaden varer lenger', () => {
        const sykmelding = lagSykmelding()
        const soknad = lagSoknad(sykmelding.id)

        const { result } = renderHook(() => useTidslinjeKombinert([sykmelding], [soknad], ingenKlipp))

        expect(dayjs(result.current.senesteSluttDato).format('YYYY-MM-DD')).toBe('2026-01-31')
    })

    it('faller tilbake til søknadsdatoer når sykmeldingsspenn mangler', () => {
        const soknad = lagSoknad('sykmelding-1')

        const { result } = renderHook(() => useTidslinjeKombinert([], [soknad], ingenKlipp))

        expect(dayjs(result.current.senesteSluttDato).format('YYYY-MM-DD')).toBe('2026-03-31')
    })
})
