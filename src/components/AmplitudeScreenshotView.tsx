import React, { useCallback, useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Link, ReadMore } from '@navikt/ds-react'

import { AmplitudeResponse } from '../queryhooks/useAmplitudedata'

import { EventGruppe, parseEvents } from './eventParsing'

export const AmplitudeScreenshotView = ({ data }: { data: AmplitudeResponse }) => {
    const parsedEvents = parseEvents(data.events)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [alertLukket, setAlertLukket] = useState(false)

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
    }, [setCurrentIndex])

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, parsedEvents.length - 1))
    }, [setCurrentIndex, parsedEvents])

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === 'ArrowLeft') {
                handlePrevious()
            } else if (event.key === 'ArrowRight') {
                handleNext()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleNext, handlePrevious])

    const eventGruppe = parsedEvents[currentIndex]
    return (
        <>
            {!alertLukket && (
                <Alert
                    variant="warning"
                    size="small"
                    className="mb-4"
                    closeButton={true}
                    onClose={() => setAlertLukket(true)}
                >
                    Screenshotsene er ikke en til en med eventene i de fleste tilfeller. Screenshots kan også bli
                    utdatert.
                </Alert>
            )}
            <BodyShort>{eventGruppe.tidspunkt.format('D MMM YYYY HH:mm:ss')}</BodyShort>
            <Link href={'https://' + eventGruppe.url} target="_blank">
                {eventGruppe.url}
            </Link>
            {eventGruppe.eventTekster.map((e, i) => {
                return (
                    <BodyShort key={i} className="py-0">
                        {e}
                    </BodyShort>
                )
            })}
            <ReadMore header="Hele eventet">
                <pre>{JSON.stringify(eventGruppe.events, null, 2)}</pre>
            </ReadMore>
            <div className="fixed bottom-24">
                <Screenshot eventgruppe={eventGruppe}></Screenshot>
            </div>
            <div className="space-x-4 fixed inset-x-0 bottom-0 bg-gray-800 text-white p-4">
                <Button variant="primary-neutral" onClick={handlePrevious} disabled={currentIndex === 0}>
                    Forrige
                </Button>
                <span>
                    {currentIndex + 1}/{parsedEvents.length}
                </span>
                <Button
                    variant="primary-neutral"
                    onClick={handleNext}
                    disabled={currentIndex === parsedEvents.length - 1}
                >
                    Neste
                </Button>
            </div>
        </>
    )
}

const Screenshot = ({ eventgruppe }: { eventgruppe: EventGruppe }) => {
    function imagePng() {
        if (eventgruppe.url === 'www.nav.no/') {
            return 'www.nav.no.png'
        }
        if (eventgruppe.url === 'www.nav.no/kontaktoss') {
            return 'www.nav.no.kontaktoss.png'
        }
        if (eventgruppe.url === 'www.nav.no/syk/sykepengesoknad') {
            return 'www.nav.no.syk.sykepengesoknad.png'
        }
    }

    const png = imagePng()
    if (png) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={'/static/' + png} alt="screenshot" />
    }

    return null
}
