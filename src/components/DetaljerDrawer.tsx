import React, { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Button, Heading } from '@navikt/ds-react'
import { XMarkIcon } from '@navikt/aksel-icons'

import { Detaljer } from './Detaljer'
import { Filter } from './Filter'

const Z_DRAWER = 99999
const DRAWER_WIDTH = 500

interface DrawerInnhold {
    tittel: string
    innhold: React.ReactNode
}

interface DetaljerDrawerProps {
    innhold: DrawerInnhold | null
    onLukk: () => void
}

export function lagSykmeldingDrawerInnhold(
    sykmelding: object,
    periodeInfo: React.ReactNode,
    filter: Filter[],
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>,
): DrawerInnhold {
    return {
        tittel: 'Sykmelding',
        innhold: (
            <div className="space-y-4">
                {periodeInfo}
                <Detaljer objekt={sykmelding} filter={filter} setFilter={setFilter} />
            </div>
        ),
    }
}

export function lagSoknadDrawerInnhold(
    soknad: object,
    filter: Filter[],
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>,
): DrawerInnhold {
    return {
        tittel: 'Søknad',
        innhold: <Detaljer objekt={soknad} filter={filter} setFilter={setFilter} />,
    }
}

export function lagKlippetSoknadDrawerInnhold(
    klippetSoknad: object,
    filter: Filter[],
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>,
): DrawerInnhold {
    return {
        tittel: 'Klippet søknad',
        innhold: <Detaljer objekt={klippetSoknad} filter={filter} setFilter={setFilter} />,
    }
}

export default function DetaljerDrawer({ innhold, onLukk }: DetaljerDrawerProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
    const erApen = innhold !== null

    if (!mounted) return null

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: erApen ? 0 : -DRAWER_WIDTH,
                width: DRAWER_WIDTH,
                height: '100%',
                zIndex: Z_DRAWER,
                background: 'white',
                borderLeft: '1px solid #e5e7eb',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'right 0.3s ease-in-out',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={innhold?.tittel ?? 'Detaljer'}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '12px 20px',
                }}
            >
                <Heading size="small">{innhold?.tittel ?? ''}</Heading>
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<XMarkIcon aria-hidden />}
                    onClick={onLukk}
                    aria-label="Lukk"
                />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: '0.875rem' }}>
                {innhold?.innhold}
            </div>
        </div>,
        document.body,
    )
}
