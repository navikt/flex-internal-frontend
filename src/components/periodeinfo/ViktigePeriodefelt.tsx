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
        <div className="space-y-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <ul className="space-y-2">
                    {viktigeFelt.map((felt) => (
                        <li
                            key={felt.etikett}
                            className={`flex items-start gap-3 p-2 text-sm ${felt.etikett === 'Status' ? `${hentFargeFraStatus(felt.verdi as string)} rounded-2xl` : ''}`}
                        >
                            <span className="flex shrink-0 items-center text-gray-700">{hentIkon(felt.etikett)}</span>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-700">{felt.etikett}</span>
                                <span className="flex items-center gap-1 text-gray-900">
                                    {felt.verdi}
                                    {(felt.etikett.toLowerCase().endsWith(' id') ||
                                        felt.etikett.toLowerCase().startsWith('id')) && (
                                        <CopyButton size="xsmall" copyText={String(felt.verdi)} />
                                    )}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {delperiodeTekster.length > 1 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 font-semibold text-gray-700">
                            <span className="flex items-center text-gray-700">
                                <FilesIcon aria-hidden fontSize="1.25rem" />
                            </span>
                            Perioder
                        </li>
                        {delperiodeTekster.map((tekst, indeks) => (
                            <li key={`${tekst}-${indeks}`} className="ml-6 text-sm text-gray-900">
                                {tekst}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
