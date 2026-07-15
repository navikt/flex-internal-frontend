import React from 'react'
import { EarthIcon } from '@navikt/aksel-icons'
import { Timeline } from '@navikt/ds-react'

import { ArbeidsgiverGruppering } from '../../utils/gruppering'
import { dayjsToDate } from '../../queryhooks/useSoknader'
import { lagOppholdUtlandSoknadDrawerInnhold, type DrawerInnhold } from '../DetaljerDrawer'
import ViktigeFeltForSoknad from '../periodeinfo/ViktigeFeltForSoknad'

export type OnDrawerValgt = (kildeId: string | null, drawer: DrawerInnhold | null) => void

interface Props {
    soknaderGruppert: Map<string, ArbeidsgiverGruppering>
    aktivDrawerKildeId: string | null
    onDrawerValgt: OnDrawerValgt
}

export const lagOppholdUtlandPins = ({
    soknaderGruppert,
    aktivDrawerKildeId,
    onDrawerValgt,
}: Props): React.ReactElement[] => {
    return Array.from(soknaderGruppert.get('opphold_utland')?.sykmeldinger.values() ?? []).flatMap((syk) =>
        Array.from(syk.soknader.values()).flatMap((sok) => {
            const dato = dayjsToDate(sok.soknad.opprettetDato)
            if (!dato) return []
            const kildeId = sok.soknad.id

            return [
                <Timeline.Pin
                    key={sok.soknad.id}
                    date={dato}
                    onMouseDown={(e) => {
                        if (e.button !== 0) return
                        if (aktivDrawerKildeId === kildeId) {
                            onDrawerValgt(null, null)
                        } else {
                            onDrawerValgt(
                                kildeId,
                                lagOppholdUtlandSoknadDrawerInnhold(
                                    sok.soknad,
                                    <ViktigeFeltForSoknad soknad={sok.soknad} />,
                                ),
                            )
                        }
                    }}
                >
                    <span
                        className="flex cursor-pointer items-center gap-1 text-sm font-semibold hover:underline"
                        onClick={() => {
                            if (aktivDrawerKildeId === kildeId) {
                                onDrawerValgt(null, null)
                            } else {
                                onDrawerValgt(
                                    kildeId,
                                    lagOppholdUtlandSoknadDrawerInnhold(
                                        sok.soknad,
                                        <ViktigeFeltForSoknad soknad={sok.soknad} />,
                                    ),
                                )
                            }
                        }}
                    >
                        <EarthIcon aria-hidden fontSize="1.25rem" />
                        Opphold utland søknad
                    </span>
                </Timeline.Pin>,
            ]
        }),
    )
}
