import React from 'react'
import { addMonths, subMonths } from 'date-fns'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

import { SykmeldingerPerArbeidsgiver } from '../sykmelding/sykmeldingTidslinjeUtils'

import SykmeldingTidslinje from './SykmeldingTidslinje'

const ingenSykmeldinger = new Map<string, SykmeldingerPerArbeidsgiver>()

describe('DagensDatoPin', () => {
    it('vises når dagens dato er innenfor tidsvinduet', () => {
        const aktivTidsvindu = {
            fra: subMonths(new Date(), 1),
            til: addMonths(new Date(), 1),
        }

        const { container } = render(
            <SykmeldingTidslinje
                sykmeldingerGruppertPaArbeidsgiver={ingenSykmeldinger}
                aktivTidsvindu={aktivTidsvindu}
                aktivPeriodeId={null}
                aktivDrawerKildeId={null}
                onPeriodeValgt={vi.fn()}
            />,
        )

        expect(container.querySelector('[data-timeline-pin][data-idag]')).toBeInTheDocument()
    })

    it('vises ikke når dagens dato er utenfor tidsvinduet', () => {
        const aktivTidsvindu = {
            fra: new Date('2020-01-01T00:00:00Z'),
            til: new Date('2020-06-30T00:00:00Z'),
        }

        const { container } = render(
            <SykmeldingTidslinje
                sykmeldingerGruppertPaArbeidsgiver={ingenSykmeldinger}
                aktivTidsvindu={aktivTidsvindu}
                aktivPeriodeId={null}
                aktivDrawerKildeId={null}
                onPeriodeValgt={vi.fn()}
            />,
        )

        expect(container.querySelector('[data-timeline-pin][data-idag]')).not.toBeInTheDocument()
    })

    it('vises ikke når tidsvinduet slutter i går', () => {
        const aktivTidsvindu = {
            fra: subMonths(new Date(), 2),
            til: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
        }

        const { container } = render(
            <SykmeldingTidslinje
                sykmeldingerGruppertPaArbeidsgiver={ingenSykmeldinger}
                aktivTidsvindu={aktivTidsvindu}
                aktivPeriodeId={null}
                aktivDrawerKildeId={null}
                onPeriodeValgt={vi.fn()}
            />,
        )

        expect(container.querySelector('[data-timeline-pin][data-idag]')).not.toBeInTheDocument()
    })
})
