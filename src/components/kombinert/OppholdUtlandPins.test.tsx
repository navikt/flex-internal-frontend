import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Soknad } from '../../queryhooks/useSoknader'
import { ArbeidsgiverGruppering } from '../../utils/gruppering'

import { lagOppholdUtlandPins } from './OppholdUtlandPins'

const lagUtlandGruppering = (soknad: Soknad): Map<string, ArbeidsgiverGruppering> =>
    new Map([
        [
            'opphold_utland',
            {
                sykmeldinger: new Map([
                    [
                        soknad.id,
                        {
                            soknader: new Map([[soknad.id, { soknad, klippingAvSoknad: [] }]]),
                            klippingAvSykmelding: [],
                        },
                    ],
                ]),
            },
        ],
    ])

const utlandSoknad = new Soknad({
    id: 'utland-1',
    soknadstype: 'OPPHOLD_UTLAND',
    status: 'NY',
    opprettetDato: '2023-05-15T09:30:00.000000',
    soknadPerioder: [],
})

describe('lagOppholdUtlandPins', () => {
    it('returnerer en pin for søknad med opprettetDato', () => {
        const pins = lagOppholdUtlandPins({
            soknaderGruppert: lagUtlandGruppering(utlandSoknad),
            aktivDrawerKildeId: null,
            onDrawerValgt: vi.fn(),
        })

        expect(pins).toHaveLength(1)
    })

    it('returnerer ingen pins for søknad uten opprettetDato', () => {
        const soknadUtenDato = new Soknad({
            id: 'utland-2',
            soknadstype: 'OPPHOLD_UTLAND',
            status: 'NY',
            soknadPerioder: [],
        })

        const pins = lagOppholdUtlandPins({
            soknaderGruppert: lagUtlandGruppering(soknadUtenDato),
            aktivDrawerKildeId: null,
            onDrawerValgt: vi.fn(),
        })

        expect(pins).toHaveLength(0)
    })

    it('klikk på wrapper kaller onDrawerValgt med kildeId og drawer-innhold', () => {
        const onDrawerValgt = vi.fn()

        const pins = lagOppholdUtlandPins({
            soknaderGruppert: lagUtlandGruppering(utlandSoknad),
            aktivDrawerKildeId: null,
            onDrawerValgt,
        })

        const wrapper = pins[0]
        wrapper.props.onClickCapture({ stopPropagation: vi.fn() })

        expect(onDrawerValgt).toHaveBeenCalledOnce()
        const [kildeId, drawer] = onDrawerValgt.mock.calls[0]
        expect(kildeId).toBe('utland-1')
        expect(drawer).not.toBeNull()
        expect(drawer.tittel).toBe('Opphold utland søknad')
    })

    it('klikk lukker skuffen når den allerede er åpen for denne søknaden', () => {
        const onDrawerValgt = vi.fn()

        const pins = lagOppholdUtlandPins({
            soknaderGruppert: lagUtlandGruppering(utlandSoknad),
            aktivDrawerKildeId: 'utland-1',
            onDrawerValgt,
        })

        const wrapper = pins[0]
        wrapper.props.onClickCapture({ stopPropagation: vi.fn() })

        expect(onDrawerValgt).toHaveBeenCalledOnce()
        expect(onDrawerValgt).toHaveBeenCalledWith(null, null)
    })

    it('popover-innholdet inneholder ingen knapp', () => {
        const pins = lagOppholdUtlandPins({
            soknaderGruppert: lagUtlandGruppering(utlandSoknad),
            aktivDrawerKildeId: null,
            onDrawerValgt: vi.fn(),
        })

        const wrapper = pins[0]
        const pinElement = wrapper.props.children as React.ReactElement
        const popoverInnhold = pinElement.props.children as React.ReactElement
        expect(popoverInnhold.type).toBe('span')
        expect(popoverInnhold.props.children).toBeDefined()
    })
})
