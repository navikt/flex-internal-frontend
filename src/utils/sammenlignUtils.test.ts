import { describe, expect, it } from 'vitest'

import { toDate } from './dato-utils'
import { flatUtObjekt, formaterVerdiSammenlign, sammenlignObjekter } from './sammenlignUtils'

describe('flatUtObjekt', () => {
    it('flater ut flate objekt', () => {
        const resultat = flatUtObjekt({ navn: 'Ole', alder: 30 })
        expect(resultat).toEqual({ navn: 'Ole', alder: '30' })
    })

    it('flater ut nestet objekt med dot-notation', () => {
        const resultat = flatUtObjekt({ arbeidsgiver: { navn: 'NAV', orgnr: '123' } })
        expect(resultat).toEqual({ 'arbeidsgiver.navn': 'NAV', 'arbeidsgiver.orgnr': '123' })
    })

    it('håndterer tomt objekt som verdi', () => {
        const resultat = flatUtObjekt({ a: {} })
        expect(resultat).toEqual({ a: '{}' })
    })

    it('håndterer tom array', () => {
        const resultat = flatUtObjekt({ perioder: [] })
        expect(resultat).toEqual({ perioder: '[]' })
    })

    it('håndterer array med verdier', () => {
        const resultat = flatUtObjekt({ perioder: ['2024-01-01', '2024-02-01'] })
        expect(resultat['perioder[0]']).toMatch(/1.*jan.*2024/i)
        expect(resultat['perioder[1]']).toMatch(/1.*feb.*2024/i)
    })

    it('formaterer datostreng (date-only, Oslo-kalenderdag)', () => {
        const resultat = flatUtObjekt({ fom: '2024-01-15' })
        expect(resultat['fom']).toMatch(/15.*jan.*2024/i)
    })

    it('formaterer datostreng med offset-tidspunkt (bevarer instant, viser klokkeslett)', () => {
        // 2024-03-20T10:15:00Z er før DST-start (31. mars 2024): Oslo er CET (UTC+1) → 20. mars kl. 11:15
        const resultat = flatUtObjekt({ tidspunkt: '2024-03-20T10:15:00Z' })
        expect(resultat['tidspunkt']).toMatch(/20.*mar.*2024.*\d{2}:\d{2}/i)
    })

    it('formaterer Date-objekt', () => {
        const resultat = flatUtObjekt({ fom: toDate('2024-03-20') })
        expect(resultat['fom']).toMatch(/20.*mar.*2024/i)
    })

    it('formaterer Invalid Date uten å kaste', () => {
        expect(() => flatUtObjekt({ fom: new Date('ugyldig') })).not.toThrow()
        const resultat = flatUtObjekt({ fom: new Date('ugyldig') })
        expect(resultat['fom']).toBe('Invalid Date')
    })

    it('håndterer null-verdier', () => {
        const resultat = flatUtObjekt({ felt: null })
        expect(resultat).toEqual({ felt: 'null' })
    })

    it('håndterer boolean-verdier', () => {
        const resultat = flatUtObjekt({ aktiv: true, slettet: false })
        expect(resultat).toEqual({ aktiv: 'true', slettet: 'false' })
    })
})

describe('formaterVerdiSammenlign', () => {
    it('skiller dato uten klokkeslett fra timestamp med klokkeslett', () => {
        expect(formaterVerdiSammenlign('2024-06-01')).not.toMatch(/\d{2}:\d{2}/)
        expect(formaterVerdiSammenlign('2024-06-01T08:30:00Z')).toMatch(/\d{2}:\d{2}/)
    })

    it('behandler streng som ikke er en dato som ren tekst', () => {
        expect(formaterVerdiSammenlign('ARBEIDSTAKER')).toBe('ARBEIDSTAKER')
        expect(formaterVerdiSammenlign('2024-99-99')).toBe('2024-99-99')
    })

    it('gir Invalid Date for Date-objekt med NaN-tid, ikke en kastet feil', () => {
        expect(() => formaterVerdiSammenlign(new Date(NaN))).not.toThrow()
        expect(formaterVerdiSammenlign(new Date(NaN))).toBe('Invalid Date')
    })
})

describe('sammenlignObjekter', () => {
    it('returnerer lik=true for identiske felt', () => {
        const rader = sammenlignObjekter({ status: 'SENDT' }, { status: 'SENDT' })
        expect(rader).toHaveLength(1)
        expect(rader[0]).toMatchObject({ nøkkel: 'status', verdi1: 'SENDT', verdi2: 'SENDT', erLik: true })
    })

    it('returnerer lik=false for forskjellige felt', () => {
        const rader = sammenlignObjekter({ status: 'SENDT' }, { status: 'AVBRUTT' })
        expect(rader[0]).toMatchObject({ nøkkel: 'status', verdi1: 'SENDT', verdi2: 'AVBRUTT', erLik: false })
    })

    it('viser felt som mangler i det ene objektet', () => {
        const rader = sammenlignObjekter({ a: '1', b: '2' }, { a: '1' })
        const radB = rader.find((r) => r.nøkkel === 'b')
        expect(radB).toMatchObject({ verdi1: '2', verdi2: undefined, erLik: false })
    })

    it('håndterer tomt objekt som verdi', () => {
        const rader = sammenlignObjekter({ arsak: {} }, { arsak: null })
        const rad = rader.find((r) => r.nøkkel === 'arsak')
        expect(rad).toBeDefined()
        expect(rad!.erLik).toBe(false)
        expect(rad!.verdi1).toBe('{}')
        expect(rad!.verdi2).toBe('null')
    })

    it('sorterer nøklene alfabetisk', () => {
        const rader = sammenlignObjekter({ z: '1', a: '2' }, { z: '1', a: '2' })
        expect(rader[0].nøkkel).toBe('a')
        expect(rader[1].nøkkel).toBe('z')
    })

    it('sammenligner nestede objekt-felt', () => {
        const rader = sammenlignObjekter({ arbeidsgiver: { navn: 'NAV' } }, { arbeidsgiver: { navn: 'NHO' } })
        const rad = rader.find((r) => r.nøkkel === 'arbeidsgiver.navn')
        expect(rad).toMatchObject({ verdi1: 'NAV', verdi2: 'NHO', erLik: false })
    })

    it('sammenligner Date-felt mellom to objekter', () => {
        const rader = sammenlignObjekter({ fom: toDate('2024-01-01') }, { fom: toDate('2024-01-02') })
        const rad = rader.find((r) => r.nøkkel === 'fom')
        expect(rad?.erLik).toBe(false)
        expect(rad?.verdi1).toMatch(/1.*jan.*2024/i)
        expect(rad?.verdi2).toMatch(/2.*jan.*2024/i)
    })
})
