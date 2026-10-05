import type { NextApiRequest, NextApiResponse } from 'next'
import { describe, expect, it, vi } from 'vitest'

import { sykepengesoknaderTestdata } from './sykepengesoknaderTestdata'
import { sykmeldingerTestdata } from './sykmeldingerTestdata'
import { mockApi } from './testdata'
import { hentVedtakTestdata } from './vedtakTestdata'

async function hentMockGet(backend: string, sti: string) {
    const status = vi.fn().mockReturnThis()
    const json = vi.fn().mockReturnThis()
    const end = vi.fn().mockReturnThis()
    const res = { status, json, end } as unknown as NextApiResponse
    const req = { method: 'GET', url: `/api/${backend}${sti}` } as NextApiRequest
    const kall = mockApi({
        req,
        res,
        backend,
        hostname: backend,
        backendClientId: '',
        tillatteApier: [`GET ${sti.replace(/\/[^/]+$/, '/[uuid]')}`],
    })
    await vi.advanceTimersByTimeAsync(200)
    await kall
    return { status, json, end }
}

describe('mockApi GET med ID', () => {
    it('returnerer søknaden som har ID-en i URL-en, ikke første søknad', async () => {
        vi.useFakeTimers()
        try {
            const søknad = sykepengesoknaderTestdata.sykepengesoknadListe[1]
            const { status, json } = await hentMockGet(
                'sykepengesoknad-backend',
                `/api/v1/flex/sykepengesoknader/${søknad.id}`,
            )

            expect(status).toHaveBeenCalledWith(200)
            const sykmelding = sykmeldingerTestdata.find((s) => s.id === søknad.sykmeldingId)
            expect(json).toHaveBeenCalledWith({ fnr: sykmelding?.pasient.fnr, sykepengesoknad: søknad })
        } finally {
            vi.useRealTimers()
        }
    })

    it('returnerer sykmeldingen som har ID-en i URL-en, ikke første sykmelding', async () => {
        vi.useFakeTimers()
        try {
            const sykmelding = sykmeldingerTestdata.find(
                (s) => s.id === sykepengesoknaderTestdata.sykepengesoknadListe[1].sykmeldingId,
            )
            expect(sykmelding).toBeDefined()
            const { status, json } = await hentMockGet(
                'flex-sykmeldinger-backend',
                `/api/v1/flex/sykmeldinger/${sykmelding?.id}`,
            )

            expect(status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith(sykmelding)
        } finally {
            vi.useRealTimers()
        }
    })

    it.each([
        ['sykepengesoknad-backend', '/api/v1/flex/sykepengesoknader'],
        ['flex-sykmeldinger-backend', '/api/v1/flex/sykmeldinger'],
    ])('gir 404 når %s ikke har oppgitt ID', async (backend, sti) => {
        vi.useFakeTimers()
        try {
            const { status, json, end } = await hentMockGet(backend, `${sti}/11111111-1111-1111-1111-111111111111`)

            expect(status).toHaveBeenCalledWith(404)
            expect(json).not.toHaveBeenCalled()
            expect(end).toHaveBeenCalled()
        } finally {
            vi.useRealTimers()
        }
    })
})

describe('mockApi vedtak for søknad', () => {
    it('svarer med samme omsluttende vedtak-felt som backend', async () => {
        vi.useFakeTimers()
        try {
            const søknadId = sykepengesoknaderTestdata.sykepengesoknadListe[1].id
            const status = vi.fn().mockReturnThis()
            const json = vi.fn().mockReturnThis()
            const end = vi.fn().mockReturnThis()
            const body = JSON.stringify({ fnr: '12345678901', soknadId: søknadId })
            const req = {
                method: 'POST',
                url: '/api/spinnsyn-backend/api/v1/flex/vedtak/soknad',
                async *[Symbol.asyncIterator]() {
                    yield Buffer.from(body)
                },
            } as unknown as NextApiRequest
            const res = { status, json, end } as unknown as NextApiResponse
            const kall = mockApi({
                req,
                res,
                backend: 'spinnsyn-backend',
                hostname: 'spinnsyn-backend',
                backendClientId: '',
                tillatteApier: ['POST /api/v1/flex/vedtak/soknad'],
            })

            await vi.advanceTimersByTimeAsync(200)
            await kall

            expect(status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith({ vedtak: hentVedtakTestdata(søknadId) })
        } finally {
            vi.useRealTimers()
        }
    })
})
