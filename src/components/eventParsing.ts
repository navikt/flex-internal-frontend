import dayjs, { Dayjs } from 'dayjs'

import { AmplitudeEvent } from '../queryhooks/useAmplitudedata'

export interface EventGruppe {
    events: AmplitudeEvent[]
    tidspunkt: Dayjs
    url: string
    eventTekster: string[]
}

export function parseEvents(events: AmplitudeEvent[]): EventGruppe[] {
    // Sorter eventene etter tidspunkt, fra tidligst til senest
    const sortedEvents = events.sort((a, b) => {
        return dayjs(a.client_event_time).isBefore(dayjs(b.client_event_time)) ? -1 : 1
    })

    // Grupper eventer basert på tidsforskjell mindre enn 30ms
    const groupedEvents: AmplitudeEvent[][] = []
    let currentGroup: AmplitudeEvent[] = []

    sortedEvents.forEach((event, index) => {
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

    return groupedEvents.map((eventArray) => {
        const eventTekster = eventArray.map((e) => {
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

        const gruppa: EventGruppe = {
            events: eventArray,
            eventTekster: eventTekster,
            url: eventArray[0].event_properties.url,
            tidspunkt: dayjs(eventArray[0].client_event_time),
        }
        return gruppa
    })
}
