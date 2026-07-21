import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'

import { sykmeldingerTestdata } from '../testdata/sykmeldingerTestdata'

import { mapTilSykmelding } from './useSykmeldinger'

describe('mapTilSykmelding hendelser', () => {
    it('tar med hendelser og konverterer tidspunkt til dayjs', () => {
        const backendSykmelding = sykmeldingerTestdata[0]

        const sykmelding = mapTilSykmelding(backendSykmelding)

        expect(sykmelding.hendelser.length).toBe(backendSykmelding.hendelser.length)
        expect(dayjs.isDayjs(sykmelding.hendelser[0].hendelseOpprettet)).toBe(true)
        expect(dayjs.isDayjs(sykmelding.hendelser[0].lokaltOpprettet)).toBe(true)
    })
})

describe('sykmeldingerTestdata hendelser', () => {
    it('gir hver sykmelding minst én hendelse med APEN først', () => {
        expect(sykmeldingerTestdata.length).toBeGreaterThan(0)

        sykmeldingerTestdata.forEach((sykmelding) => {
            expect(sykmelding.hendelser.length).toBeGreaterThanOrEqual(1)
            expect(sykmelding.hendelser[0].status).toBe('APEN')
        })
    })
})
