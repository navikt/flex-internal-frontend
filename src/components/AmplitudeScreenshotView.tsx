import React, { useCallback, useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Link, Switch } from '@navikt/ds-react'

import { AmplitudeResponse } from '../queryhooks/useAmplitudedata'

import { EventGruppe, parseEvents } from './eventParsing'

export const AmplitudeScreenshotView = ({ data }: { data: AmplitudeResponse }) => {
    const parsedEvents = parseEvents(data.events)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [alertLukket, setAlertLukket] = useState(false)
    const [json, setJson] = useState(false)
    const [mobil, setMobil] = useState(false)
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
            <div className="min-h-44">
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
            </div>
            {json && <pre>{JSON.stringify(eventGruppe.events, null, 2)}</pre>}
            {!json && (
                <div className="">
                    <Screenshot eventgruppe={eventGruppe} mobil={mobil}></Screenshot>
                </div>
            )}
            <div className="space-x-4 fixed items-center inset-x-0 bottom-0 bg-gray-200 p-4 flex">
                <Button variant="primary-neutral" onClick={handlePrevious} disabled={currentIndex === 0}>
                    Forrige
                </Button>
                <BodyShort>
                    {currentIndex + 1}/{parsedEvents.length}
                </BodyShort>
                <Button
                    variant="primary-neutral"
                    onClick={handleNext}
                    disabled={currentIndex === parsedEvents.length - 1}
                >
                    Neste
                </Button>
                <Switch
                    checked={mobil}
                    onClick={() => {
                        setMobil(!mobil)
                    }}
                >
                    Mobil
                </Switch>
                <Switch
                    checked={json}
                    onClick={() => {
                        setJson(!json)
                    }}
                >
                    JSON
                </Switch>
            </div>
        </>
    )
}

const Screenshot = ({ eventgruppe, mobil }: { eventgruppe: EventGruppe; mobil: boolean }) => {
    function imagePng() {
        const urlUtenTrailingSlash = eventgruppe.url.replace(/\/$/, '')

        if (urlUtenTrailingSlash === 'www.nav.no') {
            return 'www.nav.no'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/kontaktoss') {
            return 'www.nav.no.kontaktoss'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad') {
            return 'www.nav.no.syk.sykepengesoknad'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/minside') {
            return 'www.nav.no.minside'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/minside/nb/varsler') {
            return 'www.nav.no.minside.nb.varsler'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]/1') {
            return 'soknad-forsteside'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]') {
            return 'soknad-forsteside'
        }
        if (urlUtenTrailingSlash.startsWith('www.nav.no/syk/sykepengesoknad/soknader/[redacted]/')) {
            return 'soknad-sporsmal'
        }
        return null
    }

    const filnavn = imagePng()
    if (filnavn) {
        const plattform = mobil ? 'mobil' : 'desktop'
        if (filnavn) {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    style={{ maxHeight: '70vh' }}
                    src={'/static/amplitude/' + plattform + '/' + filnavn + '.png'}
                    alt="screenshot"
                />
            )
        }
    }
    return null
}
