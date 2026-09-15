import React from 'react'
import { BodyShort, Button, HStack } from '@navikt/ds-react'
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { differenceInCalendarDays, isAfter, isBefore } from 'date-fns'

import { AktivTidsvindu } from '../utils/tidslinjeUtils'
import { formaterDato } from '../utils/dato-utils'
import { tilOsloDatoFraDato } from '../utils/dato-utils'

type Blaretning = 'bakover' | 'framover'

interface Tidsgrenser {
    grenseFra: Date
    grenseTil: Date
}

const kanBlaBakover = (vindu: AktivTidsvindu, grenser: Tidsgrenser): boolean => {
    const fra = tilOsloDatoFraDato(vindu.fra)
    const grenseFra = tilOsloDatoFraDato(grenser.grenseFra)
    const bredde = differenceInCalendarDays(tilOsloDatoFraDato(vindu.til), fra)
    const grenseBredde = differenceInCalendarDays(tilOsloDatoFraDato(grenser.grenseTil), grenseFra)
    if (grenseBredde <= bredde) return false
    return isAfter(fra, grenseFra)
}

const kanBlaFramover = (vindu: AktivTidsvindu, grenser: Tidsgrenser): boolean => {
    const til = tilOsloDatoFraDato(vindu.til)
    const grenseTil = tilOsloDatoFraDato(grenser.grenseTil)
    const bredde = differenceInCalendarDays(til, tilOsloDatoFraDato(vindu.fra))
    const grenseBredde = differenceInCalendarDays(grenseTil, tilOsloDatoFraDato(grenser.grenseFra))
    if (grenseBredde <= bredde) return false
    return isBefore(til, grenseTil)
}

interface NavigerTidsvinduProps {
    vindu: AktivTidsvindu
    grenser: Tidsgrenser
    onBla: (retning: Blaretning) => void
}

export default function NavigerTidsvindu({ vindu, grenser, onBla }: NavigerTidsvinduProps) {
    return (
        <HStack gap="space-2" align="center" wrap={false}>
            <Button
                size="small"
                variant="tertiary"
                icon={<ChevronLeftIcon aria-hidden />}
                onClick={() => onBla('bakover')}
                disabled={!kanBlaBakover(vindu, grenser)}
                aria-label="Bla tilbake i tid"
            />
            <BodyShort size="small" aria-live="polite" aria-atomic="true" className="whitespace-nowrap">
                {`${formaterDato(vindu.fra, 'dd.MM.yyyy')} – ${formaterDato(vindu.til, 'dd.MM.yyyy')}`}
            </BodyShort>
            <Button
                size="small"
                variant="tertiary"
                icon={<ChevronRightIcon aria-hidden />}
                onClick={() => onBla('framover')}
                disabled={!kanBlaFramover(vindu, grenser)}
                aria-label="Bla fram i tid"
            />
        </HStack>
    )
}
