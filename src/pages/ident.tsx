import React, { useState } from 'react'
import { Search, Table } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useIdenter } from '../queryhooks/useIdenter'
import { handterIdentValidering } from '../utils/inputValidering'

const IdentPage = () => {
    const [ident, setIdent] = useState<string>()

    const { data: data } = useIdenter(ident, ident !== undefined)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Ident"
                onSearchClick={(input) => {
                    handterIdentValidering(input, setIdent)
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterIdentValidering(evt.currentTarget.value, setIdent)
                    }
                }}
            />
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
        </div>
    )
}

export const getServerSideProps = initialProps

export default IdentPage
