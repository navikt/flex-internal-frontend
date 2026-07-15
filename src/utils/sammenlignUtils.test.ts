import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'

import { flatUtObjekt, sammenlignObjekter } from './sammenlignUtils'

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
        expect(resultat['perioder[0]']).toMatch(/1.*Jan.*2024/i)
        expect(resultat['perioder[1]']).toMatch(/1.*Feb.*2024/i)
    })

    it('formaterer datostreng', () => {
        const resultat = flatUtObjekt({ fom: '2024-01-15' })
        expect(resultat['fom']).toMatch(/15.*Jan.*2024/i)
    })

    it('formaterer dayjs-objekt', () => {
        const resultat = flatUtObjekt({ fom: dayjs('2024-03-20') })
        expect(resultat['fom']).toMatch(/20.*Mar.*2024/i)
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
})
