import { describe, it, expect } from 'vitest'

import { filtrerPaFilter, hentVerdiFraSti, passerAlleFilter } from './filterlogikk'

describe('hentVerdiFraSti', () => {
    it('henter toppnivå-felt', () => {
        expect(hentVerdiFraSti({ status: 'NY' }, 'status')).toEqual({ finnes: true, verdi: 'NY' })
    })

    it('henter nestet felt med punktum-notasjon', () => {
        expect(hentVerdiFraSti({ arbeidsgiver: { navn: 'Firma AS' } }, 'arbeidsgiver.navn')).toEqual({
            finnes: true,
            verdi: 'Firma AS',
        })
    })

    it('henter arrayelement via indeks', () => {
        expect(hentVerdiFraSti({ perioder: ['A', 'B'] }, 'perioder[0]')).toEqual({ finnes: true, verdi: 'A' })
    })

    it('returnerer finnes=false for manglende felt', () => {
        expect(hentVerdiFraSti({ status: 'NY' }, 'ikkeEksisterende')).toEqual({ finnes: false, verdi: undefined })
    })

    it('returnerer finnes=false for null-verdi midt i stien', () => {
        expect(hentVerdiFraSti({ arbeidsgiver: null }, 'arbeidsgiver.navn')).toEqual({
            finnes: false,
            verdi: undefined,
        })
    })

    it('returnerer finnes=false for indeks utenfor array', () => {
        expect(hentVerdiFraSti({ perioder: [] }, 'perioder[5]')).toEqual({ finnes: false, verdi: undefined })
    })

    it('håndterer dypt nestet sti', () => {
        const objekt = { a: { b: { c: { d: 42 } } } }
        expect(hentVerdiFraSti(objekt, 'a.b.c.d')).toEqual({ finnes: true, verdi: 42 })
    })
})

describe('passerAlleFilter', () => {
    it('returnerer true med tomt filter', () => {
        expect(passerAlleFilter({ status: 'NY' }, [])).toBe(true)
    })

    it('returnerer true når inkluder-filter matcher', () => {
        const filter = [{ prop: 'status', verdi: '"NY"', inkluder: true }]
        expect(passerAlleFilter({ status: 'NY' }, filter)).toBe(true)
    })

    it('returnerer false når inkluder-filter ikke matcher', () => {
        const filter = [{ prop: 'status', verdi: '"SENDT"', inkluder: true }]
        expect(passerAlleFilter({ status: 'NY' }, filter)).toBe(false)
    })

    it('returnerer true når ekskluder-filter ikke matcher', () => {
        const filter = [{ prop: 'status', verdi: '"SENDT"', inkluder: false }]
        expect(passerAlleFilter({ status: 'NY' }, filter)).toBe(true)
    })

    it('returnerer false når ekskluder-filter matcher', () => {
        const filter = [{ prop: 'status', verdi: '"NY"', inkluder: false }]
        expect(passerAlleFilter({ status: 'NY' }, filter)).toBe(false)
    })

    it('returnerer false når felt ikke finnes og inkluder=true', () => {
        const filter = [{ prop: 'ikkeEksisterende', verdi: '"noe"', inkluder: true }]
        expect(passerAlleFilter({ status: 'NY' }, filter)).toBe(false)
    })

    it('alle filter må passe (AND-logikk)', () => {
        const filter = [
            { prop: 'status', verdi: '"NY"', inkluder: true },
            { prop: 'type', verdi: '"ARBEIDSTAKERE"', inkluder: true },
        ]
        expect(passerAlleFilter({ status: 'NY', type: 'ARBEIDSTAKERE' }, filter)).toBe(true)
        expect(passerAlleFilter({ status: 'NY', type: 'ANNET' }, filter)).toBe(false)
    })
})

describe('filtrerPaFilter', () => {
    const soknader = [
        { id: '1', status: 'NY' },
        { id: '2', status: 'SENDT' },
        { id: '3', status: 'NY' },
    ]

    it('returnerer alle ved tomt filter', () => {
        expect(filtrerPaFilter(soknader, [])).toHaveLength(3)
    })

    it('filtrerer til kun matching elementer', () => {
        const filter = [{ prop: 'status', verdi: '"NY"', inkluder: true }]
        const resultat = filtrerPaFilter(soknader, filter)
        expect(resultat).toHaveLength(2)
        expect(resultat.map((s) => s.id)).toEqual(['1', '3'])
    })

    it('ekskluder-filter fjerner matching elementer', () => {
        const filter = [{ prop: 'status', verdi: '"NY"', inkluder: false }]
        const resultat = filtrerPaFilter(soknader, filter)
        expect(resultat).toHaveLength(1)
        expect(resultat[0].id).toBe('2')
    })
})
