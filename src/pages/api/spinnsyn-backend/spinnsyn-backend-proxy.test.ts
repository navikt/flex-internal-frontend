import { describe, expect, it, vi } from 'vitest'
import { NextApiRequest, NextApiResponse } from 'next'

import { validerKall } from '../../../proxy/backendproxy'

function lagResponseMock() {
    const status = vi.fn().mockReturnThis()
    const send = vi.fn().mockReturnThis()
    const end = vi.fn().mockReturnThis()
    const res = { status, send, end } as unknown as NextApiResponse
    return { res, status, send, end }
}

function lagRequestMock(method: string, url: string) {
    return { method, url } as NextApiRequest
}

describe('spinnsyn-backend proxy whitelist', () => {
    const tillatteApier = ['POST /api/v4/veileder/vedtak/soknad']

    it('tillater POST /api/v4/veileder/vedtak/soknad', () => {
        const { res } = lagResponseMock()
        const req = lagRequestMock('POST', '/api/spinnsyn-backend/api/v4/veileder/vedtak/soknad')

        const resultat =
            validerKall({
                req,
                res,
                tillatteApier,
                backend: 'spinnsyn-backend',
                hostname: 'spinnsyn-backend',
                backendClientId: 'scope',
            }) ?? null

        expect(resultat).toEqual({
            api: 'POST /api/v4/veileder/vedtak/soknad',
            rewritedPath: '/api/v4/veileder/vedtak/soknad',
        })
    })

    it('avviser GET mot samme sti med 404', () => {
        const { res, status, send, end } = lagResponseMock()
        const req = lagRequestMock('GET', '/api/spinnsyn-backend/api/v4/veileder/vedtak/soknad')

        const resultat = validerKall({
            req,
            res,
            tillatteApier,
            backend: 'spinnsyn-backend',
            hostname: 'spinnsyn-backend',
            backendClientId: 'scope',
        })

        expect(resultat).toBeUndefined()
        expect(status).toHaveBeenCalledWith(404)
        expect(send).toHaveBeenCalledWith(null)
        expect(end).toHaveBeenCalled()
    })

    it('avviser annen spinnsyn-rute med 404', () => {
        const { res, status, send, end } = lagResponseMock()
        const req = lagRequestMock('POST', '/api/spinnsyn-backend/api/v3/vedtak')

        const resultat = validerKall({
            req,
            res,
            tillatteApier,
            backend: 'spinnsyn-backend',
            hostname: 'spinnsyn-backend',
            backendClientId: 'scope',
        })

        expect(resultat).toBeUndefined()
        expect(status).toHaveBeenCalledWith(404)
        expect(send).toHaveBeenCalledWith(null)
        expect(end).toHaveBeenCalled()
    })
})
