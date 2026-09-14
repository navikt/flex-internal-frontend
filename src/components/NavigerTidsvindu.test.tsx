import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NavigerTidsvindu from './NavigerTidsvindu'

describe('NavigerTidsvindu', () => {
    const dato = (isoString: string) => new Date(isoString)
    const defaultGrenser = { grenseFra: dato('2023-01-01'), grenseTil: dato('2024-12-31') }

    it('viser riktig formatterte datoer', () => {
        const vindu = { fra: dato('2024-05-01'), til: dato('2024-05-15') }
        render(<NavigerTidsvindu vindu={vindu} grenser={defaultGrenser} onBla={vi.fn()} />)

        expect(screen.getByText('01.05.2024 – 15.05.2024')).toBeInTheDocument()
    })

    it('kaller onBla med riktig retning', async () => {
        const onBla = vi.fn()
        const vindu = { fra: dato('2024-05-01'), til: dato('2024-05-15') }
        render(<NavigerTidsvindu vindu={vindu} grenser={defaultGrenser} onBla={onBla} />)

        await userEvent.click(screen.getByRole('button', { name: 'Bla tilbake i tid' }))
        expect(onBla).toHaveBeenCalledWith('bakover')

        await userEvent.click(screen.getByRole('button', { name: 'Bla fram i tid' }))
        expect(onBla).toHaveBeenCalledWith('framover')
    })

    it('deaktiverer bakover-knappen når man er ved grensen', () => {
        const vindu = { fra: dato('2023-01-01'), til: dato('2023-01-15') }
        render(<NavigerTidsvindu vindu={vindu} grenser={defaultGrenser} onBla={vi.fn()} />)

        expect(screen.getByRole('button', { name: 'Bla tilbake i tid' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Bla fram i tid' })).toBeEnabled()
    })

    it('deaktiverer framover-knappen når man er ved grensen', () => {
        const vindu = { fra: dato('2024-12-15'), til: dato('2024-12-31') }
        render(<NavigerTidsvindu vindu={vindu} grenser={defaultGrenser} onBla={vi.fn()} />)

        expect(screen.getByRole('button', { name: 'Bla tilbake i tid' })).toBeEnabled()
        expect(screen.getByRole('button', { name: 'Bla fram i tid' })).toBeDisabled()
    })

    it('deaktiverer begge knapper når vinduet dekker eller er større enn dataspennet', () => {
        const vindu = { fra: dato('2022-01-01'), til: dato('2025-12-31') }
        render(<NavigerTidsvindu vindu={vindu} grenser={defaultGrenser} onBla={vi.fn()} />)

        expect(screen.getByRole('button', { name: 'Bla tilbake i tid' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Bla fram i tid' })).toBeDisabled()
    })
})
