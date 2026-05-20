import React from 'react'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

import { SykmeldingerPerArbeidsgiver } from '../sykmelding/sykmeldingTidslinjeUtils'

import SykmeldingTidslinje from './SykmeldingTidslinje'

const ingenSykmeldinger = new Map<string, SykmeldingerPerArbeidsgiver>()

describe('DagensDatoPin', () => {
    it('vises når dagens dato er innenfor tidsvinduet', () => {
        const aktivTidsvindu = {
            fra: dayjs().subtract(1, 'month').toDate(),
            til: dayjs().add(1, 'month').toDate(),
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
            fra: dayjs('2020-01-01').toDate(),
            til: dayjs('2020-06-30').toDate(),
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
            fra: dayjs().subtract(2, 'month').toDate(),
            til: dayjs().subtract(1, 'day').startOf('day').toDate(),
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
