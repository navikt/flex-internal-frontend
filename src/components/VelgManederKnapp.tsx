import { Button } from '@navikt/ds-react'
import dayjs from 'dayjs'
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
                    props.setFraSelected(dayjs().subtract(props.maneder, 'month').toDate())
                    props.setTilSelected(dayjs().toDate())
                }}
            >
                {props.maneder + ' mnd'}
            </Button>
        </li>
    )
}
