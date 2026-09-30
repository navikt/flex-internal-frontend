import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DetaljerDrawer, { lagSoknadDrawerInnhold, lagSykmeldingDrawerInnhold } from './DetaljerDrawer'

const mockRefetch = vi.fn()
const mockUseVedtakForSoknad = vi.fn()

vi.mock('../queryhooks/useSoknadKafkaformat', () => ({
    useSoknadKafkaformat: () => ({ data: null, isLoading: false }),
}))

vi.mock('../queryhooks/useVedtakForSoknad', () => ({
    useVedtakForSoknad: (...args: unknown[]) => mockUseVedtakForSoknad(...args),
}))

vi.mock('../utils/useValgtFnr', () => ({
    useValgtFnr: () => ({ fnr: '12345678901' }),
}))

describe('DetaljerDrawer vedtaksoppslag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseVedtakForSoknad.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
            refetch: mockRefetch,
        })
    })

    it('viser knapp kun for soknad', () => {
        const setFilter = vi.fn()
        const setPlassering = vi.fn()

        const { rerender } = render(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={setFilter}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={setPlassering}
            />,
        )

        expect(screen.getByRole('button', { name: 'Hent vedtak' })).toBeInTheDocument()

        rerender(
            <DetaljerDrawer
                innhold={lagSykmeldingDrawerInnhold({ id: 'sykmelding-1' }, <div>Periode</div>)}
                filter={[]}
                setFilter={setFilter}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={setPlassering}
            />,
        )

        expect(screen.queryByRole('button', { name: 'Hent vedtak' })).not.toBeInTheDocument()
    })

    it('klikk på knapp kaller refetch', async () => {
        render(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={vi.fn()}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={vi.fn()}
            />,
        )

        await userEvent.click(screen.getByRole('button', { name: 'Hent vedtak' }))
        expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('viser loading og deaktiverer knapp mens henting pågår', () => {
        mockUseVedtakForSoknad.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
            refetch: mockRefetch,
        })

        render(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={vi.fn()}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={vi.fn()}
            />,
        )

        expect(screen.getByRole('button', { name: /Hent vedtak/i })).toBeDisabled()
    })

    it('viser tomtilstand og feiltilstand', () => {
        const { rerender } = render(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={vi.fn()}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={vi.fn()}
            />,
        )

        mockUseVedtakForSoknad.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
            refetch: mockRefetch,
        })

        rerender(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={vi.fn()}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={vi.fn()}
            />,
        )

        expect(screen.getByText('Ingen vedtak funnet for søknaden')).toBeInTheDocument()

        mockUseVedtakForSoknad.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
            refetch: mockRefetch,
        })

        rerender(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={vi.fn()}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={vi.fn()}
            />,
        )

        expect(screen.getByText('Kunne ikke hente vedtak for søknaden')).toBeInTheDocument()
    })

    it('viser flere vedtak med semantisk liste', () => {
        mockUseVedtakForSoknad.mockReturnValue({
            data: [
                { id: 'vedtak-1', vedtak: { dokumenter: [{ dokumentId: '1', type: 'Søknad' }], utbetaling: {} } },
                { id: 'vedtak-2', vedtak: { dokumenter: [{ dokumentId: '1', type: 'Søknad' }], utbetaling: {} } },
            ],
            isFetching: false,
            isError: false,
            refetch: mockRefetch,
        })

        render(
            <DetaljerDrawer
                innhold={lagSoknadDrawerInnhold({ id: '11111111-1111-1111-1111-111111111111' }, <div>Periode</div>)}
                filter={[]}
                setFilter={vi.fn()}
                onLukk={vi.fn()}
                plassering="hoyre"
                setPlassering={vi.fn()}
            />,
        )

        expect(screen.getByRole('list', { name: 'Vedtak for søknad' })).toBeInTheDocument()
        expect(screen.getByText('Vedtak 1')).toBeInTheDocument()
        expect(screen.getByText('Vedtak 2')).toBeInTheDocument()
    })
})
