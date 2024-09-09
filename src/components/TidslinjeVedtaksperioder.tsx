import { BodyShort, Button, DatePicker, Link, ReadMore, Table, Timeline, useDatepicker } from '@navikt/ds-react'
import React, { Fragment } from 'react'
import dayjs from 'dayjs'

import {
    FullVedtaksperiodeBehandling,
    VedtaksperiodeBehandlingStatusDbRecord,
} from '../queryhooks/useVedtaksperioderMedInntektsmeldinger'
import { spleisSporingUrl } from '../utils/environment'
import { formatterTimestamp } from '../utils/formatterDatoer'

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
        vp.soknader.forEach((soknad) => {
            datoer.push(dayjs(soknad.fom))
            datoer.push(dayjs(soknad.tom))
        })
        vp.statuser.forEach((status) => {
            datoer.push(dayjs(status.tidspunkt))
        })
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
        const org = vp.soknader[0].orgnummer || vp.soknader[0].soknadstype
        if (mappet.has(org)) {
            mappet.get(org)?.push(vp)
        } else {
            mappet.set(org, [vp])
        }
    })

    const varslinger: VedtaksperiodeBehandlingStatusDbRecord[] = []
    vedtaksperioder.forEach((vp) => {
        vp.statuser.forEach((status) => {
            if (
                [
                    'VARSLET_MANGLER_INNTEKTSMELDING_FØRSTE',
                    'VARSLET_MANGLER_INNTEKTSMELDING_ANDRE',
                    'VARSLET_VENTER_PÅ_SAKSBEHANDLER_FØRSTE',
                    'REVARSLET_VENTER_PÅ_SAKSBEHANDLER',
                ].includes(status.status)
            ) {
                varslinger.push(status)
            }
        })
    })

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline endDate={tilSelectedDay} startDate={fraSelectedDay}>
                {varslinger.map((status) => {
                    return (
                        <Timeline.Pin key={status.id} date={dayjs(status.tidspunkt).toDate()}>
                            <p>{status.status}</p>
                            <p>{formatterTimestamp(status.tidspunkt)}</p>
                        </Timeline.Pin>
                    )
                })}
                {Array.from(mappet.keys()).map((orgnummer) => {
                    const filtrertePerioder = vedtaksperioder.filter(
                        (vp) => (vp.soknader[0].orgnummer || vp.soknader[0].soknadstype) === orgnummer,
                    )
                    const gruppert = Object.values(
                        Object.groupBy(filtrertePerioder, (d) => d.soknader[0].fom + ' - ' + d.soknader[0].tom),
                    )

                    return (
                        <Timeline.Row key={orgnummer} label={orgnummer}>
                            {gruppert.map((vp) => {
                                if (!vp) return null

                                const sortertEtterOppdatert = vp.sort(
                                    (a, b) =>
                                        dayjs(a.vedtaksperiode.oppdatert).unix() -
                                        dayjs(b.vedtaksperiode.oppdatert || 0).unix(),
                                )
                                const nyeste = sortertEtterOppdatert[sortertEtterOppdatert.length - 1]
                                const vedtaksperiodeLesbar = `${dayjs(nyeste.soknader[0].fom).format(' D MMMM')} til ${dayjs(nyeste.soknader[0].tom).format(' D MMMM')}`

                                const flereSoknader = nyeste.soknader.length > 1
                                let iconTekst = nyeste.vedtaksperiode.sisteSpleisstatus
                                if (flereSoknader) {
                                    iconTekst += ' (⚠️ flere søknader på en vedtaksperiode)'
                                }
                                return (
                                    <Timeline.Period
                                        start={dayjs(nyeste.soknader[0].fom).toDate()}
                                        end={dayjs(nyeste.soknader[0].tom).toDate()}
                                        status="neutral"
                                        key={nyeste.vedtaksperiode.id}
                                        icon={iconTekst}
                                    >
                                        <Fragment>
                                            <BodyShort className="font-bold" spacing>
                                                {nyeste.vedtaksperiode.sisteSpleisstatus}
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
                                                                    <Table.DataCell>
                                                                        Spleisstatus tidspunkt
                                                                    </Table.DataCell>
                                                                    <Table.DataCell>
                                                                        {formatterTimestamp(
                                                                            behandling.vedtaksperiode
                                                                                .sisteSpleisstatusTidspunkt,
                                                                        )}
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                {behandling.vedtaksperiode
                                                                    .sisteVarslingstatusTidspunkt && (
                                                                    <Table.Row>
                                                                        <Table.DataCell>
                                                                            Varslingstatus tidspunkt
                                                                        </Table.DataCell>
                                                                        <Table.DataCell>
                                                                            {formatterTimestamp(
                                                                                behandling.vedtaksperiode
                                                                                    .sisteVarslingstatusTidspunkt,
                                                                            )}
                                                                        </Table.DataCell>
                                                                    </Table.Row>
                                                                )}
                                                                {behandling.vedtaksperiode.sisteVarslingstatus && (
                                                                    <Table.Row>
                                                                        <Table.DataCell>Varslingstatus</Table.DataCell>
                                                                        <Table.DataCell>
                                                                            {
                                                                                behandling.vedtaksperiode
                                                                                    .sisteVarslingstatus
                                                                            }
                                                                        </Table.DataCell>
                                                                    </Table.Row>
                                                                )}
                                                                <Table.Row>
                                                                    <Table.DataCell>VedtaksperiodeId</Table.DataCell>
                                                                    <Table.DataCell>
                                                                        <Link
                                                                            href={`${spleisSporingUrl()}/tilstandsmaskin/${behandling.vedtaksperiode.vedtaksperiodeId}`}
                                                                        >
                                                                            {behandling.vedtaksperiode.vedtaksperiodeId}
                                                                        </Link>
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                <Table.Row>
                                                                    <Table.DataCell>BehandlingId</Table.DataCell>
                                                                    <Table.DataCell>
                                                                        {behandling.vedtaksperiode.behandlingId}
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                {behandling.soknader.map((soknad) => {
                                                                    return (
                                                                        <>
                                                                            <Table.Row>
                                                                                <Table.DataCell>
                                                                                    SykepengesoknadUUID
                                                                                </Table.DataCell>
                                                                                <Table.DataCell>
                                                                                    {soknad.sykepengesoknadUuid}
                                                                                </Table.DataCell>
                                                                            </Table.Row>
                                                                            <Table.Row>
                                                                                <Table.DataCell>
                                                                                    Søknad sendt
                                                                                </Table.DataCell>
                                                                                <Table.DataCell>
                                                                                    {formatterTimestamp(soknad.sendt)}
                                                                                </Table.DataCell>
                                                                            </Table.Row>
                                                                            <Table.Row>
                                                                                <Table.DataCell>
                                                                                    Søknad start syketilfelle
                                                                                </Table.DataCell>
                                                                                <Table.DataCell>
                                                                                    {formatterTimestamp(
                                                                                        soknad.startSyketilfelle,
                                                                                    )}
                                                                                </Table.DataCell>
                                                                            </Table.Row>
                                                                        </>
                                                                    )
                                                                })}
                                                                {behandling.statuser.map((status) => {
                                                                    return (
                                                                        <Table.Row key={status.id}>
                                                                            <Table.DataCell>
                                                                                {formatterTimestamp(status.tidspunkt)}
                                                                            </Table.DataCell>
                                                                            <Table.DataCell>
                                                                                {status.status}
                                                                            </Table.DataCell>
                                                                        </Table.Row>
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
