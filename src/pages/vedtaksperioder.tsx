import React, { useState } from 'react'
import { Alert, Button, Radio, RadioGroup, ReadMore, TextField } from '@navikt/ds-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { initialProps } from '../initialprops/initialProps'
import FnrInput from '../components/FnrInput'
import {
    FullVedtaksperiodeBehandling,
    useVedtaksperioderMedInntektsmeldinger,
} from '../queryhooks/useVedtaksperioderMedInntektsmeldinger'
import { TidslinjeVedtaksperioder } from '../components/TidslinjeVedtaksperioder'
import { fetchJsonMedRequestId } from '../utils/fetch'
import { InntektsmeldingView } from '../components/Inntektsmeldinger'
import { isNotProd } from '../utils/environment'

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
            loading={cronJobMutation.isLoading}
            onClick={() => cronJobMutation.mutate(dayjs().add(days, 'day'))}
        >
            {days} dager
        </Button>
    )
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
        return (
            <div className="space-y-2">
                <ReadMore header="Fødselsnummer">
                    {[...fnrSet].map((f) => (
                        <div key={f}>{f}</div>
                    ))}
                </ReadMore>
            </div>
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
            {sokeinput === 'fnr' && <FnrInput setFnr={setFnr} />}
            {sokeinput === 'vedtaksperiodeid' && (
                <TextField
                    label="VedtaksperiodeID"
                    onChange={(e) => {
                        queryClient.removeQueries({
                            queryKey: ['vedtaksperioder'],
                        })
                        setVedtaksperiodeId(e.target.value)
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
                    <TidslinjeVedtaksperioder vedtaksperioder={data.vedtaksperioder} />
                </>
            )}
        </div>
    )
}

export const getServerSideProps = initialProps

export default Vedtaksperioder
