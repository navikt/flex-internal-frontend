import { BackendProxyOpts, validerKall } from '../proxy/backendproxy'

const testdata = [
    {
        id: 'f7b5d8cb-84f5-3838-bf15-153e9b346b87',
        sykmeldingId: 'c47eed19-b3f9-4982-8bda-d785551e56da',
        soknadstype: 'ARBEIDSTAKERE',
        status: 'NY',
        fom: '2023-06-01',
        tom: '2023-06-07',
        opprettetDato: '2023-06-08',
        sendtTilNAVDato: null,
        sendtTilArbeidsgiverDato: null,
        avbruttDato: null,
        startSykeforlop: '2023-04-01',
        sykmeldingUtskrevet: '2023-06-01',
        arbeidsgiver: {
            navn: 'Klonelabben',
            orgnummer: '907670201',
        },
        korrigerer: null,
        korrigertAv: null,
        arbeidssituasjon: 'ARBEIDSTAKER',
        soknadPerioder: [
            {
                fom: '2023-06-01',
                tom: '2023-06-07',
                grad: 100,
                sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
            },
        ],
        egenmeldtSykmelding: false,
        merknaderFraSykmelding: null,
        opprettetAvInntektsmelding: false,
    },
    {
        id: 'f7b5d8cb-84f5-3838-bf15-153e9b346b88',
        sykmeldingId: 'c47eed19-b3f9-4982-8bda-d785551e56db',
        soknadstype: 'ARBEIDSTAKERE',
        status: 'SENDT',
        fom: '2023-06-05',
        tom: '2023-06-15',
        opprettetDato: '2023-06-08',
        sendtTilNAVDato: null,
        sendtTilArbeidsgiverDato: null,
        avbruttDato: null,
        startSykeforlop: '2023-04-01',
        sykmeldingUtskrevet: '2023-06-01',
        arbeidsgiver: {
            navn: 'Klonelabben',
            orgnummer: '907670201',
        },
        korrigerer: null,
        korrigertAv: null,
        arbeidssituasjon: 'ARBEIDSTAKER',
        soknadPerioder: [
            {
                fom: '2023-06-05',
                tom: '2023-06-15',
                grad: 100,
                sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
            },
        ],
        egenmeldtSykmelding: false,
        merknaderFraSykmelding: null,
        opprettetAvInntektsmelding: false,
    },
]

export async function mockApi(opts: BackendProxyOpts): Promise<void> {
    const validert = validerKall(opts)
    if (!validert) return
    const { req, res } = opts
    const fnr = req.headers.fnr

    if (validert.api == 'GET /api/v1/flex/sykepengesoknader' && fnr !== undefined) {
        res.status(200)
        res.json(testdata)
        res.end()
        return
    }

    res.status(404)
    res.end()
}
