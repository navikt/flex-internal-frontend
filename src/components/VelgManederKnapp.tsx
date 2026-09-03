import { Button } from '@navikt/ds-react'
import { subMonths } from 'date-fns'
import React from 'react'

export function VelgManederKnapp(props: {
    maneder: number
    setFraSelected: (date: Date) => void
    setTilSelected: (date: Date) => void
}) {
    return (
        <li className="navds-detail">
            <Button
                data-color="neutral"
                type="button"
                size="small"
                variant="secondary"
                className="navds-timeline__zoom-button font-normal"
                onClick={() => {
                    props.setFraSelected(subMonths(new Date(), props.maneder))
                    props.setTilSelected(new Date())
                }}
            >
                {props.maneder + ' mnd'}
            </Button>
        </li>
    )
}
