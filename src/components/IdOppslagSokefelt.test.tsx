import React from 'react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import IdOppslagSokefelt from './IdOppslagSokefelt'

const mockSettFnr = vi.fn()
const mockNullstillFnr = vi.fn()

vi.mock('../utils/useValgtFnr', () => ({
    useValgtFnr: () => ({
        fnr: undefined,
        settFnr: mockSettFnr,
        nullstillFnr: mockNullstillFnr,
        valgtPeriodeId: null,
        valgtDrawerKildeId: null,
        settValgtPeriode: vi.fn(),
        nullstillValgtPeriode: vi.fn(),
    }),
}))

const mockUseSoknad = vi.fn()
const mockUseSykmelding = vi.fn()

vi.mock('../queryhooks/useSoknad', () => ({
    useSoknad: (...args: unknown[]) => mockUseSoknad(...args),
}))

vi.mock('../queryhooks/useSykmelding', () => ({
    useSykmelding: (...args: unknown[]) => mockUseSykmelding(...args),
}))

describe('IdOppslagSokefelt', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseSoknad.mockReturnValue({ data: null, isFetching: false })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: false })
    })

    it('viser søkefelt med riktig label', () => {
        render(<IdOppslagSokefelt />)
        expect(screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')).toBeInTheDocument()
    })

    it('viser feilmelding for ugyldig UUID', async () => {
        render(<IdOppslagSokefelt />)
        const input = screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')

        await userEvent.type(input, 'ikke-en-uuid{enter}')

        expect(screen.getByText('ID må være en UUID på 36 tegn')).toBeInTheDocument()
    })

    it('aksepterer gyldig UUID og trigger oppslag', async () => {
        render(<IdOppslagSokefelt />)
        const input = screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')
        const gyldigUuid = '12345678-1234-1234-1234-123456789012'

        await userEvent.type(input, gyldigUuid + '{enter}')

        expect(mockUseSoknad).toHaveBeenCalledWith(gyldigUuid, true)
        expect(mockUseSykmelding).toHaveBeenCalledWith(gyldigUuid, true)
    })

    it('setter fnr fra søknad-oppslag', async () => {
        mockUseSoknad.mockReturnValue({ data: null, isFetching: false })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: false })

        const { rerender } = render(<IdOppslagSokefelt />)
        const input = screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')
        const gyldigUuid = '12345678-1234-1234-1234-123456789012'

        await userEvent.type(input, gyldigUuid + '{enter}')

        mockUseSoknad.mockReturnValue({
            data: { fnr: '12345678901', sykepengesoknad: {} },
            isFetching: false,
        })

        rerender(<IdOppslagSokefelt />)

        expect(mockSettFnr).toHaveBeenCalledWith('12345678901')
    })

    it('setter fnr fra sykmelding-oppslag', async () => {
        mockUseSoknad.mockReturnValue({ data: null, isFetching: false })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: false })

        const { rerender } = render(<IdOppslagSokefelt />)
        const input = screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')
        const gyldigUuid = '12345678-1234-1234-1234-123456789012'

        await userEvent.type(input, gyldigUuid + '{enter}')

        mockUseSykmelding.mockReturnValue({
            data: { sykmelding: { pasient: { fnr: '98765432109' } }, fnr: '98765432109' },
            isFetching: false,
        })

        rerender(<IdOppslagSokefelt />)

        expect(mockSettFnr).toHaveBeenCalledWith('98765432109')
    })

    it('viser advarsel når ID ikke finnes', async () => {
        mockUseSoknad.mockReturnValue({ data: null, isFetching: false })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: false })

        render(<IdOppslagSokefelt />)
        const input = screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')
        const gyldigUuid = '12345678-1234-1234-1234-123456789012'

        await userEvent.type(input, gyldigUuid + '{enter}')

        expect(screen.getByText('Fant ikke fnr for oppgitt ID')).toBeInTheDocument()
    })

    it('viser ikke advarsel mens oppslag pågår', async () => {
        mockUseSoknad.mockReturnValue({ data: null, isFetching: true })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: true })

        render(<IdOppslagSokefelt />)
        const input = screen.getByLabelText('Slå opp fnr fra søknad-ID eller sykmelding-ID')
        const gyldigUuid = '12345678-1234-1234-1234-123456789012'

        await userEvent.type(input, gyldigUuid + '{enter}')

        expect(screen.queryByText('Fant ikke fnr for oppgitt ID')).not.toBeInTheDocument()
    })
})
