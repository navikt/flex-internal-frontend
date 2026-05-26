import React, { useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Button, Heading, ToggleGroup } from '@navikt/ds-react'
import { XMarkIcon, SidebarRightIcon } from '@navikt/aksel-icons'

import { useSoknadKafkaformat } from '../queryhooks/useSoknadKafkaformat'

import { Detaljer } from './Detaljer'
import { Filter } from './Filter'

type VisModus = 'vanlig' | 'kafkaformat' | 'begge'

type DrawerVariant =
    | { type: 'sykmelding'; objekt: object; periodeInfo: React.ReactNode }
    | { type: 'soknad'; soknadId: string; objekt: object; periodeInfo: React.ReactNode }
    | { type: 'klippetSoknad'; objekt: object }

export interface DrawerInnhold {
    tittel: string
    ikonHeader?: Array<{ ikon: React.ReactNode; tekst: string }>
    variant: DrawerVariant
}

interface DetaljerDrawerProps {
    innhold: DrawerInnhold | null
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    onLukk: () => void
    plassering: 'bunn' | 'hoyre'
    setPlassering: React.Dispatch<React.SetStateAction<'bunn' | 'hoyre'>>
}

export function lagSykmeldingDrawerInnhold(
    sykmelding: object,
    periodeInfo: React.ReactNode,
    ikonHeader?: Array<{ ikon: React.ReactNode; tekst: string }>,
): DrawerInnhold {
    return {
        tittel: 'Sykmelding',
        ikonHeader,
        variant: { type: 'sykmelding', objekt: sykmelding, periodeInfo },
    }
}

export function lagSoknadDrawerInnhold(
    soknad: object & { id: string },
    periodeInfo: React.ReactNode,
    ikonHeader?: Array<{ ikon: React.ReactNode; tekst: string }>,
): DrawerInnhold {
    return {
        tittel: 'Søknad',
        ikonHeader,
        variant: { type: 'soknad', soknadId: soknad.id, objekt: soknad, periodeInfo },
    }
}

export function lagOppholdUtlandSoknadDrawerInnhold(
    soknad: object & { id: string },
    periodeInfo: React.ReactNode,
): DrawerInnhold {
    return {
        tittel: 'Opphold utland søknad',
        variant: { type: 'soknad', soknadId: soknad.id, objekt: soknad, periodeInfo },
    }
}

export function lagKlippetSoknadDrawerInnhold(klippetSoknad: object): DrawerInnhold {
    return {
        tittel: 'Klippet søknad',
        variant: { type: 'klippetSoknad', objekt: klippetSoknad },
    }
}

function SoknadInnholdRenderer({
    variant,
    filter,
    setFilter,
    plassering,
    visModus,
}: {
    variant: Extract<DrawerVariant, { type: 'soknad' }>
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    plassering: 'bunn' | 'hoyre'
    visModus: VisModus
}) {
    const [kafkaformatFilter, setKafkaformatFilter] = useState<Filter[]>([])
    const { data: kafkaformatData } = useSoknadKafkaformat(
        variant.soknadId,
        visModus === 'kafkaformat' || visModus === 'begge',
    )

    const vanligDetaljer = <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
    const kafkaDetaljer = kafkaformatData ? (
        <Detaljer objekt={kafkaformatData} filter={kafkaformatFilter} setFilter={setKafkaformatFilter} />
    ) : (
        <span className="text-gray-400 text-sm">Laster kafkaformat...</span>
    )

    if (plassering === 'bunn') {
        if (visModus === 'begge') {
            return (
                <div className="flex h-full gap-4">
                    <div className="w-1/4 overflow-y-auto">{variant.periodeInfo}</div>
                    <div className="w-[37.5%] overflow-y-auto">{vanligDetaljer}</div>
                    <div className="w-[37.5%] overflow-y-auto">{kafkaDetaljer}</div>
                </div>
            )
        }
        return (
            <div className="flex h-full gap-6">
                <div className="w-1/2 overflow-y-auto">{variant.periodeInfo}</div>
                <div className="w-1/2 overflow-y-auto">
                    {visModus === 'kafkaformat' ? kafkaDetaljer : vanligDetaljer}
                </div>
            </div>
        )
    }

    if (visModus === 'begge') {
        return (
            <div className="space-y-4">
                {variant.periodeInfo}
                <div className="flex gap-4">
                    <div className="w-1/2 overflow-y-auto">{vanligDetaljer}</div>
                    <div className="w-1/2 overflow-y-auto">{kafkaDetaljer}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {variant.periodeInfo}
            {visModus === 'kafkaformat' ? kafkaDetaljer : vanligDetaljer}
        </div>
    )
}

function DrawerInnholdRenderer({
    variant,
    filter,
    setFilter,
    plassering,
    visModus,
}: {
    variant: DrawerVariant
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    plassering: 'bunn' | 'hoyre'
    visModus: VisModus
}) {
    switch (variant.type) {
        case 'sykmelding':
            if (plassering === 'bunn') {
                return (
                    <div className="flex h-full gap-6">
                        <div className="w-1/2 overflow-y-auto">{variant.periodeInfo}</div>
                        <div className="w-1/2 overflow-y-auto">
                            <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
                        </div>
                    </div>
                )
            }
            return (
                <div className="space-y-4">
                    {variant.periodeInfo}
                    <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
                </div>
            )
        case 'soknad':
            return (
                <SoknadInnholdRenderer
                    variant={variant}
                    filter={filter}
                    setFilter={setFilter}
                    plassering={plassering}
                    visModus={visModus}
                />
            )
        case 'klippetSoknad':
            return <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
    }
}

export default function DetaljerDrawer({
    innhold,
    filter,
    setFilter,
    onLukk,
    plassering,
    setPlassering,
}: DetaljerDrawerProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
    const [visModus, setVisModus] = useState<VisModus>('vanlig')
    const erApen = innhold !== null
    const erBunn = plassering === 'bunn'
    const erSoknad = innhold?.variant.type === 'soknad'
    const erBegge = visModus === 'begge'

    if (!mounted) return null

    const posisjonKlasser = erBunn
        ? [
              'fixed bottom-0 left-0 z-[99999] flex h-1/2 w-full flex-col',
              'border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
              'transition-transform duration-300 ease-in-out',
              erApen ? 'translate-y-0' : 'translate-y-full',
          ]
        : [
              'fixed top-0 right-0 z-[99999] flex h-full flex-col',
              erSoknad && erBegge ? 'w-[900px]' : 'w-[500px]',
              'border-l border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.12)]',
              'transition-[transform,width] duration-300 ease-in-out',
              erApen ? 'translate-x-0' : 'translate-x-full',
          ]

    return createPortal(
        <div
            className={posisjonKlasser.join(' ')}
            style={{ backgroundColor: '#ffffff' }}
            role="dialog"
            aria-modal="true"
            aria-label={innhold?.tittel ?? 'Detaljer'}
        >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Heading size="small">{innhold?.tittel ?? ''}</Heading>
                    {innhold?.ikonHeader && innhold.ikonHeader.length > 0 && (
                        <div className="flex flex-col gap-0.5">
                            {innhold.ikonHeader.map((par, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="flex items-center" aria-hidden>
                                        {par.ikon}
                                    </span>
                                    {par.tekst}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {erSoknad && (
                        <ToggleGroup
                            value={visModus}
                            onChange={(v) => setVisModus(v as VisModus)}
                            size="small"
                            variant="neutral"
                        >
                            <ToggleGroup.Item value="vanlig">Vanlig</ToggleGroup.Item>
                            <ToggleGroup.Item value="kafkaformat">Kafka</ToggleGroup.Item>
                            <ToggleGroup.Item value="begge">Begge</ToggleGroup.Item>
                        </ToggleGroup>
                    )}
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={<SidebarRightIcon aria-hidden />}
                        onClick={() => setPlassering(erBunn ? 'hoyre' : 'bunn')}
                        aria-label={erBunn ? 'Bytt til høyre side' : 'Bytt til bunnen'}
                        title={erBunn ? 'Bytt til høyre side' : 'Bytt til bunnen'}
                    />
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={<XMarkIcon aria-hidden />}
                        onClick={onLukk}
                        aria-label="Lukk"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-hidden px-5 py-4 text-sm">
                {innhold && (
                    <DrawerInnholdRenderer
                        variant={innhold.variant}
                        filter={filter}
                        setFilter={setFilter}
                        plassering={plassering}
                        visModus={visModus}
                    />
                )}
            </div>
        </div>,
        document.body,
    )
}
