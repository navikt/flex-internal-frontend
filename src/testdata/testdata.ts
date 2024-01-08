import { BackendProxyOpts, validerKall } from '../proxy/backendproxy'

const testdata = {
    sykepengesoknadListe: [
        {
            id: '124f3422-36f7-33f5-bfd3-1d3080545246',
            sykmeldingId: '70df59fa-e1a3-4f38-bc3d-6a1fb2349c04',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            fom: '2023-01-01',
            tom: '2023-01-29',
            opprettetDato: '2023-06-12T16:24:31.185172',
            sendtTilNAVDato: '2023-06-13T10:09:31.045548',
            sendtTilArbeidsgiverDato: '2023-06-13T10:09:31.045548',
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-01-01T01:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-01-01',
                    tom: '2023-01-29',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: 'b1621dbb-2d0a-3a82-b8be-d892a91fd7cf',
            sykmeldingId: '70df59fa-e1a3-4f38-bc3d-6a1fb2349c04',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            fom: '2023-01-30',
            tom: '2023-02-26',
            opprettetDato: '2023-06-12T16:24:31.185225',
            sendtTilNAVDato: '2023-06-13T10:09:41.301409',
            sendtTilArbeidsgiverDato: '2023-06-13T10:09:41.301409',
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-01-01T01:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-01-30',
                    tom: '2023-02-26',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '813adafc-d468-304c-a00d-917c3ab31a08',
            sykmeldingId: '70df59fa-e1a3-4f38-bc3d-6a1fb2349c04',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-02-27',
            tom: '2023-03-26',
            opprettetDato: '2023-06-12T16:24:31.18527',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-01-01T01:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-02-27',
                    tom: '2023-03-26',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '84fffb36-2dd7-357c-bfc3-c22ce7368851',
            sykmeldingId: '884b8a9f-e24a-432d-b1c6-89bbac272513',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-10',
            tom: '2023-04-16',
            opprettetDato: '2023-06-12T16:24:43.617707',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-10T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-10',
                    tom: '2023-04-16',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '8ec860d4-b4ad-34bf-9d94-5c363aade289',
            sykmeldingId: 'd02d8d3a-b58e-44b2-8b41-5279865360a6',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-17',
            tom: '2023-04-23',
            opprettetDato: '2023-06-12T16:25:14.513627',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-17T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-17',
                    tom: '2023-04-23',
                    grad: 60,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '7ee89646-1feb-34df-85f0-f18e9d30bba5',
            sykmeldingId: '2e6666d0-2540-40f2-99b6-083cbd91934d',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-24',
            tom: '2023-04-26',
            opprettetDato: '2023-06-12T16:25:23.350876',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-24T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-24',
                    tom: '2023-04-26',
                    grad: 80,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '6cfdd38f-ebf4-373b-96e9-e5b4f9558940',
            sykmeldingId: 'de68e6ed-3cb6-4e3b-9cf0-0a07c234c629',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-27',
            tom: '2023-05-21',
            opprettetDato: '2023-06-12T16:25:34.139101',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-27T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-27',
                    tom: '2023-05-21',
                    grad: 100,
                    sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '217305a5-ea12-313b-ac24-14202087dd40',
            sykmeldingId: '468ecc00-7346-4a71-80a9-61d890971f6e',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-05-22',
            tom: '2023-06-10',
            opprettetDato: '2023-06-19T08:59:52.327839',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-06-26T02:00:00',
            sykmeldingSignaturDato: '2023-06-19T08:59:30.38144',
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-05-22',
                    tom: '2023-06-10',
                    grad: 100,
                    sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '6527094e-b6b5-3c88-8ca3-e11c5ab33503',
            sykmeldingId: '468ecc00-7346-4a71-80a9-61d890971f6e',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'FREMTIDIG',
            fom: '2023-06-11',
            tom: '2023-06-30',
            opprettetDato: '2023-06-19T08:59:52.327943',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-06-26T02:00:00',
            sykmeldingSignaturDato: '2023-06-19T08:59:30.38144',
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-06-11',
                    tom: '2023-06-30',
                    grad: 100,
                    sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
                },
            ],
            merknaderFraSykmelding: null,
        },
    ],
    klippetSykepengesoknadRecord: [
        {
            id: '5670cce5-ecc9-4f7a-81f6-33d4ea53aaaf',
            sykepengesoknadUuid: '84fffb36-2dd7-357c-bfc3-c22ce7368851',
            sykmeldingUuid: 'd02d8d3a-b58e-44b2-8b41-5279865360a6',
            klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-04-10","tom":"2023-04-30","grad":50,"sykmeldingstype":"GRADERT"}]',
            periodeEtter: '[{"fom":"2023-04-10","tom":"2023-04-16","grad":50,"sykmeldingstype":"GRADERT"}]',
            timestamp: '2023-06-12T14:25:13.956976Z',
        },
        {
            id: 'c00f891f-918d-463b-9d4b-7892b1209b00',
            sykepengesoknadUuid: '8ec860d4-b4ad-34bf-9d94-5c363aade289',
            sykmeldingUuid: '2e6666d0-2540-40f2-99b6-083cbd91934d',
            klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-04-17","tom":"2023-04-30","grad":60,"sykmeldingstype":"GRADERT"}]',
            periodeEtter: '[{"fom":"2023-04-17","tom":"2023-04-23","grad":60,"sykmeldingstype":"GRADERT"}]',
            timestamp: '2023-06-12T14:25:22.931157Z',
        },
        {
            id: 'b133de12-1e1c-4249-ac61-27ee52298f54',
            sykepengesoknadUuid: '7ee89646-1feb-34df-85f0-f18e9d30bba5',
            sykmeldingUuid: 'de68e6ed-3cb6-4e3b-9cf0-0a07c234c629',
            klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-04-24","tom":"2023-04-30","grad":80,"sykmeldingstype":"GRADERT"}]',
            periodeEtter: '[{"fom":"2023-04-24","tom":"2023-04-26","grad":80,"sykmeldingstype":"GRADERT"}]',
            timestamp: '2023-06-12T14:25:33.499050Z',
        },
        {
            id: '74c5f650-f35a-47c6-b873-8f69390f9e70',
            sykepengesoknadUuid: '19967e57-7d84-367a-967f-c7a205cfce78',
            sykmeldingUuid: '468ecc00-7346-4a71-80a9-61d890971f6e',
            klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-05-22","tom":"2023-06-10","grad":100,"sykmeldingstype":"AKTIVITET_IKKE_MULIG"}]',
            periodeEtter: null,
            timestamp: '2023-06-19T06:59:52.064271Z',
        },
        {
            id: '8674cc23-dbe7-47bf-95f6-4a3d6695ea39',
            sykepengesoknadUuid: '4e045b47-39ee-395c-b3b9-50a12891de45',
            sykmeldingUuid: '468ecc00-7346-4a71-80a9-61d890971f6e',
            klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-06-11","tom":"2023-06-30","grad":100,"sykmeldingstype":"AKTIVITET_IKKE_MULIG"}]',
            periodeEtter: null,
            timestamp: '2023-06-19T06:59:52.264863Z',
        },
    ],
}

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
    const ident = req.headers.ident

    if (validert.api == 'GET /api/v1/flex/identer' && ident !== undefined) {
        res.status(200)
        res.json([
            { gruppe: 'FOLKEREGISTERIDENT', ident: ident },
            {
                gruppe: 'FOLKEREGISTERIDENT',
                ident: '11111111111',
            },
            { gruppe: 'AKTORID', ident: '1111111111122' },
        ])
        res.end()
        return
    }
    if (validert.api == 'POST /api/v1/flex/republiser/[uuid]') {
        setTimeout(() => {
            res.status(200)
            res.end()
        }, 1000)
        return
    }

    res.status(404)
    res.end()
}
