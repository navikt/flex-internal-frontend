import React from 'react'
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'

import VelgZoomPeriode from './VelgZoomPeriode'

describe('VelgZoomPeriode', () => {
    describe('rendring', () => {
        it('viser alle fem zoom-knapper', () => {
            render(<VelgZoomPeriode setFraDato={vi.fn()} setTilDato={vi.fn()} />)
            expect(screen.getByRole('button', { name: /3 måneder/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /7 måneder/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /9 måneder/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /2 år/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /alle perioder/i })).toBeInTheDocument()
        })
    })

    describe('klikk på zoom-knapper', () => {
        it('3 mnd setter fraDato 3 måneder tilbake og tilDato til i dag', async () => {
            const setFraDato = vi.fn()
            const setTilDato = vi.fn()
            render(<VelgZoomPeriode setFraDato={setFraDato} setTilDato={setTilDato} />)

            await userEvent.click(screen.getByRole('button', { name: /3 måneder/i }))

            expect(setFraDato).toHaveBeenCalledOnce()
            const fraDato = setFraDato.mock.calls[0][0] as Date
            expect(dayjs(fraDato).isSame(dayjs().subtract(3, 'month'), 'day')).toBe(true)

            expect(setTilDato).toHaveBeenCalledOnce()
            const tilDato = setTilDato.mock.calls[0][0] as Date
            expect(dayjs(tilDato).isSame(dayjs(), 'day')).toBe(true)
        })

        it('2 år setter fraDato 2 år tilbake', async () => {
            const setFraDato = vi.fn()
            render(<VelgZoomPeriode setFraDato={setFraDato} setTilDato={vi.fn()} />)

            await userEvent.click(screen.getByRole('button', { name: /2 år/i }))

            const fraDato = setFraDato.mock.calls[0][0] as Date
            expect(dayjs(fraDato).isSame(dayjs().subtract(2, 'year'), 'day')).toBe(true)
        })

        it('Alle nullstiller begge datoer', async () => {
            const setFraDato = vi.fn()
            const setTilDato = vi.fn()
            render(<VelgZoomPeriode setFraDato={setFraDato} setTilDato={setTilDato} />)

            await userEvent.click(screen.getByRole('button', { name: /alle perioder/i }))

            expect(setFraDato).toHaveBeenCalledWith(null)
            expect(setTilDato).toHaveBeenCalledWith(null)
        })
    })

    describe('maxTilDato-logikk', () => {
        it('bruker maxTilDato når den er i fremtiden', async () => {
            const setTilDato = vi.fn()
            const fremtidigDato = dayjs().add(30, 'day').toDate()
            render(<VelgZoomPeriode setFraDato={vi.fn()} setTilDato={setTilDato} maxTilDato={fremtidigDato} />)

            await userEvent.click(screen.getByRole('button', { name: /3 måneder/i }))

            expect(setTilDato).toHaveBeenCalledWith(fremtidigDato)
        })

        it('bruker i dag når maxTilDato er i fortiden', async () => {
            const setTilDato = vi.fn()
            const tidligereDato = dayjs().subtract(10, 'day').toDate()
            render(<VelgZoomPeriode setFraDato={vi.fn()} setTilDato={setTilDato} maxTilDato={tidligereDato} />)

            await userEvent.click(screen.getByRole('button', { name: /3 måneder/i }))

            const tilDato = setTilDato.mock.calls[0][0] as Date
            expect(dayjs(tilDato).isSame(dayjs(), 'day')).toBe(true)
        })

        it('bruker i dag når maxTilDato ikke er satt', async () => {
            const setTilDato = vi.fn()
            render(<VelgZoomPeriode setFraDato={vi.fn()} setTilDato={setTilDato} />)

            await userEvent.click(screen.getByRole('button', { name: /7 måneder/i }))

            const tilDato = setTilDato.mock.calls[0][0] as Date
            expect(dayjs(tilDato).isSame(dayjs(), 'day')).toBe(true)
        })
    })
})
