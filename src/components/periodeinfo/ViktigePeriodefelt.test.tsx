import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import ViktigePeriodefelt from './ViktigePeriodefelt'

describe('ViktigePeriodefelt', () => {
    describe('rendring av felt', () => {
        it('viser etiketten og verdien for hvert felt', () => {
            render(
                <ViktigePeriodefelt
                    viktigeFelt={[
                        { etikett: 'Fra', verdi: '2024-01-01' },
                        { etikett: 'Til', verdi: '2024-01-31' },
                    ]}
                />,
            )
            expect(screen.getByText('Fra:')).toBeInTheDocument()
            expect(screen.getByText('2024-01-01')).toBeInTheDocument()
            expect(screen.getByText('Til:')).toBeInTheDocument()
            expect(screen.getByText('2024-01-31')).toBeInTheDocument()
        })

        it('alle felt rendres inni én felles kortboks', () => {
            const { container } = render(
                <ViktigePeriodefelt
                    viktigeFelt={[
                        { etikett: 'Fra', verdi: '2024-01-01' },
                        { etikett: 'Til', verdi: '2024-01-31' },
                    ]}
                />,
            )
            const kortbokser = container.querySelectorAll('.rounded.border')
            expect(kortbokser).toHaveLength(1)
        })

        it('viser CopyButton for felt som slutter på " id"', () => {
            const { container } = render(
                <ViktigePeriodefelt viktigeFelt={[{ etikett: 'Sykmelding ID', verdi: 'abc-123' }]} />,
            )
            expect(container.querySelectorAll('button').length).toBeGreaterThan(0)
        })

        it('viser CopyButton for felt som starter med "ID"', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'ID', verdi: 'uuid-456' }]} />)
            expect(container.querySelectorAll('button').length).toBeGreaterThan(0)
        })

        it('viser ikke CopyButton for vanlige felt', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Status', verdi: 'SENDT' }]} />)
            expect(container.querySelectorAll('button')).toHaveLength(0)
        })

        it('viser tallverdi korrekt', () => {
            render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Grad', verdi: 80 }]} />)
            expect(screen.getByText('80')).toBeInTheDocument()
        })
    })

    describe('statusfarger', () => {
        it('viser advarselsfarge for AVBRUTT-status', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Status', verdi: 'AVBRUTT' }]} />)
            expect(container.querySelector('.bg-ax-bg-warning-moderate')).toBeInTheDocument()
        })

        it('viser suksessfarge for SENDT-status', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Status', verdi: 'SENDT' }]} />)
            expect(container.querySelector('.bg-ax-bg-success-moderate')).toBeInTheDocument()
        })

        it('viser infofarge for ukjent status', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Status', verdi: 'NY' }]} />)
            expect(container.querySelector('.bg-ax-bg-info-moderate')).toBeInTheDocument()
        })

        it('statussammenligning er case-insensitiv', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Status', verdi: 'sendt' }]} />)
            expect(container.querySelector('.bg-ax-bg-success-moderate')).toBeInTheDocument()
        })

        it('statusfelt får fargeklasse', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Status', verdi: 'SENDT' }]} />)
            expect(container.querySelector('.bg-ax-bg-success-moderate')).toBeInTheDocument()
        })

        it('vanlig felt har ikke statusfarge', () => {
            const { container } = render(<ViktigePeriodefelt viktigeFelt={[{ etikett: 'Fra', verdi: '2024-01-01' }]} />)
            expect(container.querySelector('.bg-ax-bg-success-moderate')).not.toBeInTheDocument()
            expect(container.querySelector('.bg-ax-bg-warning-moderate')).not.toBeInTheDocument()
        })
    })

    describe('delperiodeTekster', () => {
        it('viser ikke periodeliste ved 0 tekster', () => {
            render(
                <ViktigePeriodefelt viktigeFelt={[{ etikett: 'Fra', verdi: '2024-01-01' }]} delperiodeTekster={[]} />,
            )
            expect(screen.queryByText('Perioder')).not.toBeInTheDocument()
        })

        it('viser ikke periodeliste ved kun én tekst', () => {
            render(
                <ViktigePeriodefelt
                    viktigeFelt={[{ etikett: 'Fra', verdi: '2024-01-01' }]}
                    delperiodeTekster={['01.01 – 31.01']}
                />,
            )
            expect(screen.queryByText('Perioder')).not.toBeInTheDocument()
        })

        it('viser periodeliste og alle tekster ved to eller flere perioder', () => {
            render(
                <ViktigePeriodefelt
                    viktigeFelt={[{ etikett: 'Fra', verdi: '2024-01-01' }]}
                    delperiodeTekster={['01.01 – 15.01', '16.01 – 31.01']}
                />,
            )
            expect(screen.getByText('Perioder')).toBeInTheDocument()
            expect(screen.getByText('01.01 – 15.01')).toBeInTheDocument()
            expect(screen.getByText('16.01 – 31.01')).toBeInTheDocument()
        })

        it('periodeblokken er en egen kortboks ved siden av felt-kortet', () => {
            const { container } = render(
                <ViktigePeriodefelt
                    viktigeFelt={[{ etikett: 'Fra', verdi: '2024-01-01' }]}
                    delperiodeTekster={['01.01 – 15.01', '16.01 – 31.01']}
                />,
            )
            // 1 felt-kort + 1 periodeblokk = 2 kortbokser
            expect(container.querySelectorAll('.rounded.border')).toHaveLength(2)
        })
    })
})
