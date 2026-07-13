import React from 'react'
import {
    TagIcon,
    CheckmarkCircleFillIcon,
    NotePencilIcon,
    ClockIcon,
    CalendarIcon,
    BriefcaseIcon,
    SectorChartIcon,
    SplitHorizontalIcon,
    CheckmarkCircleIcon,
    TimerStartIcon,
    PersonCheckmarkIcon,
} from '@navikt/aksel-icons'

export const hentIkon = (etikett: string): React.ReactNode => {
    switch (etikett) {
        case 'ID':
        case 'Sykmelding ID':
        case 'Ventetid sykmelding ID':
            return <TagIcon aria-hidden fontSize="1.25rem" />
        case 'Status':
            return <CheckmarkCircleFillIcon aria-hidden fontSize="1.25rem" />
        case 'Signatur dato':
            return <NotePencilIcon aria-hidden fontSize="1.25rem" />
        case 'Behandlet tidspunkt':
            return <PersonCheckmarkIcon aria-hidden fontSize="1.25rem" />
        case 'Grad':
            return <SectorChartIcon aria-hidden fontSize="1.25rem" />
        case 'Ventetid':
            return <ClockIcon aria-hidden fontSize="1.25rem" />
        case 'Fra':
        case 'Opprettet dato':
            return <TimerStartIcon aria-hidden fontSize="1.25rem" />
        case 'Til':
            return <CheckmarkCircleIcon aria-hidden fontSize="1.25rem" />
        case 'Antall delperioder':
            return <SplitHorizontalIcon aria-hidden fontSize="1.25rem" />
        case 'Antall kalenderdager':
            return <CalendarIcon aria-hidden fontSize="1.25rem" />
        case 'Arbeidssituasjon':
            return <BriefcaseIcon aria-hidden fontSize="1.25rem" />
        default:
            return '•'
    }
}

export const hentStatusFarge = (status: string): 'warning' | 'success' | 'info' => {
    const s = status.toUpperCase()
    if (['AVBRUTT', 'SLETTET', 'UTGAATT'].includes(s)) return 'warning'
    if (['SENDT', 'KORRIGERT'].includes(s)) return 'success'
    return 'info'
}
