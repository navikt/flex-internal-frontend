import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { AmplitudeEvent } from '../queryhooks/useAmplitudedata'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface EventGruppe {
    events: AmplitudeEvent[]
    tidspunkt: Dayjs
    url: string
    eventTekster: string[]
}

export interface EventGruppeMedDetaljer extends EventGruppe {
    sidevisning: 'generell' | 'soknadssporsmal'
    soknadstype?: string
    spormalTag?: string
}

export function parseEvents(events: AmplitudeEvent[]): EventGruppeMedDetaljer[] {
    // Sorter eventene etter tidspunkt, fra tidligst til senest
    const sortedEvents = events.sort((a, b) => {
        return dayjs(a.client_event_time).isBefore(dayjs(b.client_event_time)) ? -1 : 1
    })

    // Grupper eventer basert på tidsforskjell mindre enn 30ms
    const groupedEvents: AmplitudeEvent[][] = []
    let currentGroup: AmplitudeEvent[] = []

    sortedEvents.forEach((event, index) => {
        //Fjern trailing slash fra url
        event.event_properties.url = event.event_properties.url.replace(/\/$/, '')
        if (index === 0) {
            // Starter den første gruppen med det første eventet
            currentGroup.push(event)
        } else {
            const previousEvent = sortedEvents[index - 1]
            // Sjekk om tidsforskjellen mellom dette og forrige event er mindre enn 30ms
            if (
                dayjs(event.client_event_time).diff(dayjs(previousEvent.client_event_time), 'ms') < 1000 &&
                event.event_properties.url == previousEvent.event_properties.url
            ) {
                // Legg til i nåværende gruppe
                currentGroup.push(event)
            } else {
                // Tidsforskjellen er større, start en ny gruppe
                groupedEvents.push(currentGroup)
                currentGroup = [event]
            }
        }
    })

    // Legg til den siste gruppen hvis den inneholder eventer
    if (currentGroup.length > 0) {
        groupedEvents.push(currentGroup)
    }

    const eventerProssesrt = groupedEvents
        .map((eventArray) => {
            const eventTekster = eventArray
                .map((e) => {
                    const eventer = [
                        e.event_type,
                        e.event_properties.component,
                        e.event_properties.komponent,
                        e.event_properties.tekst,
                        e.event_properties.soknadstype,
                        e.event_properties.spørsmål,
                        e.event_properties.svar,
                        e.event_properties.tittel,
                        e.event_properties.composition,
                    ]
                    if (e.event_properties.dagerSidenSisteUtbetaling !== undefined) {
                        eventer.push(` ${e.event_properties.dagerSidenSisteUtbetaling} dager siden siste utbetaling`)
                    }
                    if (e.event_properties.dagerTilMaksdato !== undefined) {
                        eventer.push(`${e.event_properties.dagerTilMaksdato} dager til maksdato`)
                    }

                    if (e.event_properties.destinasjon !== undefined) {
                        eventer.push(`destinasjon ${e.event_properties.destinasjon}`)
                    }

                    return eventer
                        .filter((e) => !!e)
                        .filter((e) => e !== 'besøk')
                        .join(' - ')
                })
                .filter((e) => e.length > 0)

            const gruppa: EventGruppe = {
                events: eventArray,
                eventTekster: eventTekster,
                url: eventArray[0].event_properties.url,
                tidspunkt: dayjs.tz(eventArray[0].client_event_time, 'UTC').tz('Europe/Oslo'),
            }
            return gruppa
        })
        .map((g): EventGruppeMedDetaljer => {
            const newVar: EventGruppeMedDetaljer = {
                sidevisning: 'generell',
                ...g,
            }
            if (g.url.startsWith('www.nav.no/syk/sykepengesoknad/soknader/[redacted]/')) {
                newVar.sidevisning = 'soknadssporsmal'
                newVar.soknadstype = g.events.map((e) => e.event_properties.soknadstype).find((e) => !!e)
                newVar.spormalTag = g.events.map((e) => e.event_properties.spørsmål).find((e) => !!e)
            }
            return newVar
        })
        .filter((g) => {
            if (g.sidevisning === 'soknadssporsmal') {
                return g.eventTekster.length > 0
            }
            return true
        })
        .filter((g) => {
            return g.url !== 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]'
        })

    return eventerProssesrt
        .map((g) => {
            if (g.sidevisning == 'soknadssporsmal') {
                if (!g.soknadstype) {
                    const closest = eventerProssesrt.find((e) => e.url === g.url && e.soknadstype)
                    if (closest) {
                        g.soknadstype = closest.soknadstype
                    }
                }
            }
            return g
        })
        .map((g) => {
            if (g.sidevisning == 'soknadssporsmal') {
                if (!g.spormalTag) {
                    const closest = eventerProssesrt.find((e) => e.url === g.url && e.soknadstype)
                    if (closest) {
                        g.spormalTag = closest.spormalTag
                    }
                }
            }
            return g
        })
        .map((g) => {
            if (g.sidevisning == 'soknadssporsmal') {
                if (!g.spormalTag) {
                    if (g.url.endsWith('/1')) {
                        g.spormalTag = 'ANSVARSERKLARING'
                    }
                }
            }
            return g
        })
}
