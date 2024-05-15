import { BodyShort, Button, DatePicker, Link, ReadMore, Table, Timeline, useDatepicker } from '@navikt/ds-react'
import React, { Fragment } from 'react'
import dayjs from 'dayjs'

import { FullVedtaksperiodeBehandling } from '../queryhooks/useVedtaksperioder'
import { spleisSporingUrl } from '../utils/environment'

function VelgManederKnapp(props: {
    maneder: number
    setFraSelected: (date: Date) => void
    setTilSelected: (date: Date) => void
}) {
    return (
        <li className="navds-detail">
            <Button
                type="button"
                size="small"
                variant="secondary-neutral"
                className="navds-timeline__zoom-button font-normal"
                onClick={() => {
                    props.setFraSelected(dayjs().subtract(props.maneder, 'month').toDate())
                    props.setTilSelected(dayjs().toDate())
                }}
            >
                {props.maneder + ' mnd'}
            </Button>
        </li>
    )
}

export function TidslinjeVedtaksperioder({ vedtaksperioder }: { vedtaksperioder: FullVedtaksperiodeBehandling[] }) {
    const datoer = [] as dayjs.Dayjs[]
    vedtaksperioder.forEach((vp) => {
        datoer.push(dayjs(vp.soknad.fom))
        datoer.push(dayjs(vp.soknad.tom))
    })

    const eldsteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))[0]
    const nyesteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? 1 : -1))[0]

    const {
        datepickerProps: fraDatepickerProps,
        inputProps: fraInputprops,
        selectedDay: fraSelectedDay,
        setSelected: setFraSelected,
    } = useDatepicker({
        defaultSelected: eldsteDato.toDate(),
    })

    const {
        datepickerProps: tilDatepickerProps,
        inputProps: tilInputprops,
        selectedDay: tilSelectedDay,
        setSelected: setTilSelected,
    } = useDatepicker({
        defaultSelected: nyesteDato.add(1, 'week').toDate(),
    })

    // grupper perioder per soknad.orgnummer
    // Map med orgnummer som key og FullVedtaksperiode[] som value
    const mappet = new Map<string, FullVedtaksperiodeBehandling[]>()
    vedtaksperioder.forEach((vp) => {
        const org = vp.soknad.orgnummer || 'ukjent'
        if (mappet.has(org)) {
            mappet.get(org)?.push(vp)
        } else {
            mappet.set(org, [vp])
        }
    })

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline endDate={tilSelectedDay} startDate={fraSelectedDay}>
                {Array.from(mappet.keys()).map((orgnummer) => {
                    const filtrertePerioder = vedtaksperioder.filter((vp) => vp.soknad.orgnummer === orgnummer)
                    const gruppert = Object.values(
                        Object.groupBy(filtrertePerioder, (d) => d.soknad.fom + ' - ' + d.soknad.tom),
                    )

                    return (
                        <Timeline.Row key={orgnummer} label={orgnummer}>
                            {gruppert.map((vp) => {
                                if (!vp) return null

                                function firstOrNull<T>(array: T[] | null | undefined): T | null {
                                    return array?.[0] ?? null
                                }

                                const sortertEtterOppdatert = vp.sort(
                                    (a, b) =>
                                        dayjs(firstOrNull(a.vedtaksperioder)?.vedtaksperiode.oppdatert || 0).unix() -
                                        dayjs(firstOrNull(b.vedtaksperioder)?.vedtaksperiode.oppdatert || 0).unix(),
                                )
                                const nyeste = sortertEtterOppdatert[sortertEtterOppdatert.length - 1]
                                const vedtaksperiodeLesbar = `${dayjs(nyeste.soknad.fom).format(' D MMMM')} til ${dayjs(nyeste.soknad.tom).format(' D MMMM')}`

                                const flerePerioder = nyeste.vedtaksperioder.length > 1
                                let iconTekst =
                                    firstOrNull(nyeste.vedtaksperioder)?.vedtaksperiode.sisteSpleisstatus || 'ukjent'
                                if (flerePerioder) {
                                    iconTekst += ' (⚠️ flere vedtaksperioder på en søknad)'
                                }
                                return (
                                    <Timeline.Period
                                        start={dayjs(nyeste.soknad.fom).toDate()}
                                        end={dayjs(nyeste.soknad.tom).toDate()}
                                        status="neutral"
                                        key={nyeste.soknad.id}
                                        icon={iconTekst}
                                    >
                                        <Fragment>
                                            <BodyShort className="font-bold" spacing>
                                                {firstOrNull(nyeste.vedtaksperioder)?.vedtaksperiode.sisteSpleisstatus}
                                            </BodyShort>
                                            <BodyShort spacing={true}>{vedtaksperiodeLesbar}</BodyShort>
                                            <BodyShort className="font-bold" spacing>
                                                Behandlinger
                                            </BodyShort>
                                            {sortertEtterOppdatert.map((behandling) => {
                                                return (
                                                    <>
                                                        <Table size="small" className="mb-4">
                                                            <Table.Body>
                                                                <Table.Row>
                                                                    <Table.DataCell>SykepengesoknadUUID</Table.DataCell>
                                                                    <Table.DataCell>
                                                                        {behandling.soknad.sykepengesoknadUuid}
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                <Table.Row>
                                                                    <Table.DataCell>Søknad sendt</Table.DataCell>
                                                                    <Table.DataCell>
                                                                        {dayjs(behandling.soknad.sendt).format(
                                                                            'D MMM YYYY HH:mm',
                                                                        )}
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                {behandling.vedtaksperioder.map((behandling) => {
                                                                    return (
                                                                        <>
                                                                            {behandling.vedtaksperiode && (
                                                                                <>
                                                                                    <Table.Row>
                                                                                        <Table.DataCell>
                                                                                            VedtaksperiodeId
                                                                                        </Table.DataCell>
                                                                                        <Table.DataCell>
                                                                                            <Link
                                                                                                href={
                                                                                                    spleisSporingUrl() +
                                                                                                    behandling
                                                                                                        .vedtaksperiode
                                                                                                        .vedtaksperiodeId
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    behandling
                                                                                                        .vedtaksperiode
                                                                                                        .vedtaksperiodeId
                                                                                                }
                                                                                            </Link>
                                                                                        </Table.DataCell>
                                                                                    </Table.Row>
                                                                                    <Table.Row>
                                                                                        <Table.DataCell>
                                                                                            BehandlingId
                                                                                        </Table.DataCell>
                                                                                        <Table.DataCell>
                                                                                            {
                                                                                                behandling
                                                                                                    .vedtaksperiode
                                                                                                    .behandlingId
                                                                                            }
                                                                                        </Table.DataCell>
                                                                                    </Table.Row>
                                                                                </>
                                                                            )}
                                                                            {behandling.status.map((status) => {
                                                                                return (
                                                                                    <Table.Row key={status.id}>
                                                                                        <Table.DataCell>
                                                                                            {dayjs(
                                                                                                status.tidspunkt,
                                                                                            ).format(
                                                                                                'D MMM YYYY HH:mm',
                                                                                            )}
                                                                                        </Table.DataCell>
                                                                                        <Table.DataCell>
                                                                                            {status.status}
                                                                                        </Table.DataCell>
                                                                                    </Table.Row>
                                                                                )
                                                                            })}
                                                                        </>
                                                                    )
                                                                })}
                                                            </Table.Body>
                                                        </Table>
                                                    </>
                                                )
                                            })}
                                        </Fragment>
                                    </Timeline.Period>
                                )
                            })}
                        </Timeline.Row>
                    )
                })}
            </Timeline>
            <div>
                <ul className="flex navds-timeline__zoom" style={{ float: 'none' }}>
                    <VelgManederKnapp maneder={1} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={3} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={6} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={12} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                </ul>
            </div>
            <ReadMore header="Velg datoer">
                <div className="mt-4 flex gap-x-2">
                    <DatePicker {...fraDatepickerProps}>
                        <DatePicker.Input {...fraInputprops} label="Fra" />
                    </DatePicker>
                    <DatePicker {...tilDatepickerProps}>
                        <DatePicker.Input {...tilInputprops} label="Til" />
                    </DatePicker>
                </div>
            </ReadMore>
        </div>
    )
}
