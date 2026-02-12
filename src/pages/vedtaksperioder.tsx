import React, { useState } from 'react'
import { Alert, BodyShort, Button, Link, Radio, RadioGroup, ReadMore, Search } from '@navikt/ds-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { initialProps } from '../initialprops/initialProps'
import {
    FullVedtaksperiodeBehandling,
    useVedtaksperioderMedInntektsmeldinger,
} from '../queryhooks/useVedtaksperioderMedInntektsmeldinger'
import { TidslinjeVedtaksperioder } from '../components/TidslinjeVedtaksperioder'
import { fetchJsonMedRequestId } from '../utils/fetch'
import { InntektsmeldingView } from '../components/Inntektsmeldinger'
import { isNotProd, spannerUrl, spleisSporingUrl } from '../utils/environment'
import { useIdenter } from '../queryhooks/useIdenter'
import { handterFnrValidering, handterUuidValidering } from '../utils/inputValidering'

const Vedtaksperioder = () => {
    const [fnr, setFnr] = useState<string>()
    const [vedtaksperiodeId, setVedtaksperiodeId] = useState<string>()
    const [sokeinput, setSokeinput] = useState<'vedtaksperiodeid' | 'fnr'>('vedtaksperiodeid')

    const enabled =
        (sokeinput == 'fnr' && fnr !== undefined) ||
        (sokeinput == 'vedtaksperiodeid' && vedtaksperiodeId?.length === 36)
    const {
        data: data,
        isLoading,
        isRefetching,
    } = useVedtaksperioderMedInntektsmeldinger(fnr, vedtaksperiodeId, enabled)
    const queryClient = useQueryClient()

    const cronJobMutation = useMutation<object, any, dayjs.Dayjs>({
        mutationFn: async (dato) => {
            return await fetchJsonMedRequestId<object>(
                `/api/flex-inntektsmelding-status/api/v1/cronjob?now=${dato.toISOString()}`,
                {
                    method: 'POST',
                },
            )
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['vedtaksperioder', fnr],
            })
        },
    })
    const DayButton = ({ days }: { days: number }) => (
        <Button
            size="small"
            variant="secondary"
            loading={cronJobMutation.isPending}
            onClick={() => cronJobMutation.mutate(dayjs().add(days, 'day'))}
        >
            {days} dager
        </Button>
    )
    const AktorIDVisning = ({ fnr }: { fnr: string }) => {
        const { data: data } = useIdenter(fnr, true)
        if (!data) {
            return <p>Ingen data</p>
        }
        const aktorid = data.find((d) => d.gruppe === 'AKTORID')?.ident
        if (!aktorid) {
            return <p>Ingen aktør</p>
        }
        return (
            <>
                <ReadMore header="AktørID">
                    <BodyShort>{aktorid}</BodyShort>
                </ReadMore>
                <Link href={`${spleisSporingUrl()}/person/${aktorid}`} target="_blank">
                    Spleis sporing
                </Link>
                <Link className="block" href={`${spannerUrl()}/person/${aktorid}`} target="_blank">
                    Spanner
                </Link>
            </>
        )
    }
    const FnrVisning = ({
        sokeinput,
        vedtaksperioder,
    }: {
        sokeinput: string
        vedtaksperioder: FullVedtaksperiodeBehandling[]
    }) => {
        if (sokeinput === 'fnr') {
            return null
        }
        const fnrSet = new Set<string>()
        vedtaksperioder.forEach((vp) => {
            vp.soknader.forEach((s) => {
                fnrSet.add(s.fnr)
            })
        })
        const fnrList = [...fnrSet]

        return (
            <>
                <ReadMore header="Fødselsnummer">
                    {[...fnrSet].map((f) => (
                        <div key={f}>{f}</div>
                    ))}
                </ReadMore>
                {fnrList.length > 0 && <AktorIDVisning fnr={fnrList[0]} />}
            </>
        )
    }
    return (
        <div className="flex-row space-y-4">
            <RadioGroup
                legend="Søk med:"
                size="small"
                onChange={(v) => {
                    setSokeinput(v)
                    setVedtaksperiodeId(undefined)
                    setFnr(undefined)

                    queryClient.removeQueries({
                        queryKey: ['vedtaksperioder'],
                    })
                }}
                value={sokeinput}
            >
                <Radio value="vedtaksperiodeid">VedtaksperiodeId</Radio>
                <Radio value="fnr">Fødselsnummer</Radio>
            </RadioGroup>
            {sokeinput === 'fnr' && (
                <Search
                    htmlSize="20"
                    label="Fødselsnummer"
                    onSearchClick={(input) => {
                        handterFnrValidering(input, setFnr)
                    }}
                    onKeyDown={(evt) => {
                        if (evt.key === 'Enter') {
                            handterFnrValidering(evt.currentTarget.value, setFnr)
                        }
                    }}
                />
            )}
            {sokeinput === 'vedtaksperiodeid' && (
                <Search
                    className="w-80"
                    label="VedtaksperiodeID"
                    onSearchClick={(input) => {
                        queryClient.removeQueries({
                            queryKey: ['vedtaksperioder'],
                        })
                        handterUuidValidering(
                            input,
                            setVedtaksperiodeId,
                            undefined,
                            'VedtaksperiodeID må være en UUID på 36 tegn',
                        )
                    }}
                    onKeyDown={(evt) => {
                        if (evt.key === 'Enter') {
                            queryClient.removeQueries({
                                queryKey: ['vedtaksperioder'],
                            })
                            handterUuidValidering(
                                evt.currentTarget.value,
                                setVedtaksperiodeId,
                                undefined,
                                'VedtaksperiodeID må være en UUID på 36 tegn',
                            )
                        }
                    }}
                />
            )}
            <div className="space-x-2">
                <Button
                    size="small"
                    variant="secondary"
                    loading={isRefetching}
                    onClick={async () => {
                        await queryClient.invalidateQueries({
                            queryKey: ['vedtaksperioder'],
                        })
                    }}
                >
                    Reload
                </Button>
                {isNotProd() && (
                    <>
                        <DayButton days={0} />
                        <DayButton days={1} />
                        <DayButton days={14} />
                        <DayButton days={15} />
                        <DayButton days={27} />
                        <DayButton days={28} />
                        <DayButton days={60} />
                        <DayButton days={70} />
                        <DayButton days={95} />
                        <DayButton days={130} />
                    </>
                )}
            </div>
            {cronJobMutation.data && (
                <Alert
                    variant="info"
                    closeButton={true}
                    onClose={() => {
                        cronJobMutation.reset()
                    }}
                >
                    <pre>{JSON.stringify(cronJobMutation.data, null, 2)}</pre>
                </Alert>
            )}
            {isRefetching && enabled && <span>Oppdaterer...</span>}
            {isLoading && enabled && <span>Laster...</span>}
            {!isRefetching && data && data.vedtaksperioder.length === 0 && <span>Ingen vedtaksperioder</span>}
            {!isRefetching && typeof data !== 'undefined' && (
                <InntektsmeldingView inntektsmeldinger={data.inntektsmeldinger} />
            )}
            {!isRefetching && data && data.vedtaksperioder.length > 0 && (
                <>
                    <FnrVisning vedtaksperioder={data.vedtaksperioder} sokeinput={sokeinput} />
                    {sokeinput === 'fnr' && fnr?.length == 11 && <AktorIDVisning fnr={fnr} />}
                    <TidslinjeVedtaksperioder
                        vedtaksperioder={data.vedtaksperioder}
                        forelagteOpplysninger={data.forelagteOpplysninger}
                    />
                </>
            )}
        </div>
    )
}

export const getServerSideProps = initialProps

export default Vedtaksperioder
