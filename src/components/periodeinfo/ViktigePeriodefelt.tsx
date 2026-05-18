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
        <div className="space-y-2">
            {viktigeFelt.map((felt) => (
                <div
                    key={felt.etikett}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-sm shadow-sm ${
                        felt.etikett === 'Status'
                            ? hentFargeFraStatus(felt.verdi as string) + ' border-transparent'
                            : 'border-gray-200 bg-white'
                    }`}
                >
                    <span className="mt-0.5 flex shrink-0 items-center text-gray-600">{hentIkon(felt.etikett)}</span>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{felt.etikett}</span>
                        <span className="flex items-center gap-1 font-medium text-gray-900">
                            {felt.verdi}
                            {(felt.etikett.toLowerCase().endsWith(' id') ||
                                felt.etikett.toLowerCase().startsWith('id')) && (
                                <CopyButton size="xsmall" copyText={String(felt.verdi)} />
                            )}
                        </span>
                    </div>
                </div>
            ))}

            {delperiodeTekster.length > 1 && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                        <FilesIcon aria-hidden fontSize="1.25rem" />
                        Perioder
                    </div>
                    <ul className="space-y-1">
                        {delperiodeTekster.map((tekst, indeks) => (
                            <li key={`${tekst}-${indeks}`} className="text-sm text-gray-900">
                                {tekst}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
