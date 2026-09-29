import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { VedtakOppsummering } from './VedtakOppsummering'

describe('VedtakOppsummering', () => {
    it('viser faktiske utbetalingsdager med beløp per mottaker og bevarer rådata', async () => {
        render(
            <VedtakOppsummering
                vedtak={{
                    id: 'vedtak-1',
                    orgnavn: 'Eksempel AS',
                    sykepengebelopSykmeldt: 1200,
                    sykepengebelopArbeidsgiver: 300,
                    vedtak: {
                        fom: '2026-03-01',
                        tom: '2026-03-31',
                        organisasjonsnummer: '999888777',
                        vedtakFattetTidspunkt: '2026-04-10',
                        dokumenter: [],
                        utbetaling: {
                            utbetalingType: 'UTBETALING',
                            utbetalingsdager: [
                                {
                                    dato: '2026-03-02',
                                    type: 'NavDag',
                                    beløpTilSykmeldt: 1200,
                                    beløpTilArbeidsgiver: 0,
                                    sykdomsgrad: 50,
                                    begrunnelser: [],
                                },
                                {
                                    dato: '2026-03-03',
                                    type: 'AvvistDag',
                                    beløpTilSykmeldt: null,
                                    beløpTilArbeidsgiver: 300,
                                    begrunnelser: ['MinimumInntekt'],
                                },
                            ],
                        },
                    },
                }}
            />,
        )

        expect(screen.getByText('2 dager i utbetalingen')).toBeInTheDocument()
        expect(screen.getByText(/Periode: 1.–31\. mars 2026/)).toBeInTheDocument()
        expect(screen.getAllByText('Eksempel AS').length).toBeGreaterThan(0)
        expect(screen.getByText('Organisasjonsnummer: 999888777')).toBeInTheDocument()
        expect(screen.getByText(/Til sykmeldt i vedtaket: 1\s200 kr/)).toBeInTheDocument()
        expect(screen.getByText('Til arbeidsgiver i vedtaket: 300 kr')).toBeInTheDocument()

        await userEvent.click(screen.getByText('Dager i utbetalingen (2)'))
        expect(screen.getByText('2. mars 2026')).toBeInTheDocument()
        expect(screen.getByText('3. mars 2026')).toBeInTheDocument()
        expect(screen.getAllByText(/1\s200 kr/).length).toBeGreaterThan(0)
        expect(screen.getByText('0 kr')).toBeInTheDocument()
        expect(screen.getAllByText('300 kr').length).toBeGreaterThan(0)
        expect(screen.getByText('50 %')).toBeInTheDocument()
        expect(screen.getAllByText('MinimumInntekt').length).toBeGreaterThan(0)
        expect(screen.queryByRole('rowheader', { name: '31. mars 2026' })).not.toBeInTheDocument()
        await userEvent.click(screen.getByText('Alle vedtaksdata'))
        expect(screen.getByText('utbetalingsdager:')).toBeInTheDocument()
    })

    it('skiller tom dagliste fra manglende dagliste og markerer tidligere vedtak', () => {
        const { rerender } = render(
            <VedtakOppsummering
                vedtak={{
                    id: 'vedtak-2',
                    revurdert: true,
                    vedtak: { dokumenter: [], utbetaling: { utbetalingType: 'UTBETALING', utbetalingsdager: [] } },
                }}
            />,
        )
        expect(screen.getByText('Tidligere vedtak, revurdert')).toBeInTheDocument()
        expect(screen.getByText('Ingen dager i utbetalingen')).toBeInTheDocument()

        rerender(<VedtakOppsummering vedtak={{ id: 'vedtak-3', vedtak: { dokumenter: [], utbetaling: {} } }} />)
        expect(screen.getByText('Dagliste mangler i vedtaksdata')).toBeInTheDocument()
    })
})
