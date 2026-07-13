import React from 'react'
import {
    TagIcon,
    CheckmarkCircleFillIcon,
    NotePencilIcon,
    ClockIcon,
    FilesIcon,
    CalendarIcon,
    BriefcaseIcon,
    SectorChartIcon,
    SplitHorizontalIcon,
    CheckmarkCircleIcon,
    TimerStartIcon,
    PersonCheckmarkIcon,
} from '@navikt/aksel-icons'
import { CopyButton } from '@navikt/ds-react'

interface ViktigFelt {
    etikett: string
    verdi: string | number
}

interface Props {
    viktigeFelt: ViktigFelt[]
    delperiodeTekster?: string[]
}

const hentIkon = (etikett: string): React.ReactNode => {
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

const hentFargeFraStatus = (status: string): string => {
    const statusOpperstilt = status.toUpperCase()
    if (['AVBRUTT', 'SLETTET', 'UTGAATT'].includes(statusOpperstilt)) {
        return 'bg-ax-bg-warning-moderate'
    }
    if (['SENDT', 'KORRIGERT'].includes(statusOpperstilt)) {
        return 'bg-ax-bg-success-moderate'
    }
    return 'bg-ax-bg-info-moderate'
}

export default function ViktigePeriodefelt({ viktigeFelt, delperiodeTekster = [] }: Props) {
    return (
        <div className="space-y-1.5">
            <div className="rounded border border-blue-100 bg-blue-50 px-2 py-1.5">
                <ul className="divide-y divide-blue-100">
                    {viktigeFelt.map((felt) => (
                        <li
                            key={felt.etikett}
                            className={`flex items-center gap-2 px-1 py-0.5 text-sm ${felt.etikett === 'Status' ? `${hentFargeFraStatus(felt.verdi as string)} rounded px-2` : ''}`}
                        >
                            <span className="flex shrink-0 items-center text-gray-500" style={{ fontSize: '1rem' }}>
                                {hentIkon(felt.etikett)}
                            </span>
                            <span className="min-w-0 truncate text-ax-medium text-gray-600">{felt.etikett}:</span>
                            <span className="flex min-w-0 flex-1 items-center gap-1 truncate text-gray-900">
                                {felt.verdi}
                                {(felt.etikett.toLowerCase().endsWith(' id') ||
                                    felt.etikett.toLowerCase().startsWith('id')) && (
                                    <CopyButton size="xsmall" copyText={String(felt.verdi)} />
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {delperiodeTekster.length > 1 && (
                <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
                    <ul className="divide-y divide-gray-100">
                        <li className="flex items-center gap-1.5 pb-0.5 text-ax-medium font-semibold text-gray-600">
                            <span className="flex items-center" style={{ fontSize: '1rem' }}>
                                <FilesIcon aria-hidden />
                            </span>
                            Perioder
                        </li>
                        {delperiodeTekster.map((tekst, indeks) => (
                            <li key={`${tekst}-${indeks}`} className="py-0.5 pl-5 text-ax-medium text-gray-800">
                                {tekst}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
