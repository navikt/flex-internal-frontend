import React from 'react'
import { Table, VStack } from '@navikt/ds-react'

import FnrSokefelt from '../components/FnrSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useIdenter } from '../queryhooks/useIdenter'
import { useValgtFnr } from '../utils/useValgtFnr'

const IdentPage = () => {
    const { fnr } = useValgtFnr()

    const { data: data } = useIdenter(fnr, fnr !== undefined)

    return (
        <VStack gap="space-4">
            <FnrSokefelt label="Ident" valideringstype="ident" />
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Identgruppe</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {data?.map((d, i) => {
                        return (
                            <Table.Row key={i + d.ident}>
                                <Table.DataCell>{d.gruppe}</Table.DataCell>
                                <Table.DataCell>{d.ident}</Table.DataCell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        </VStack>
    )
}

export const getServerSideProps = initialProps

export default IdentPage
