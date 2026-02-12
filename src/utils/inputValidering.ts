export function handterFnrValidering(input: string, onSuccess: (fnr: string) => void) {
    const result = validerFnr(input)
    if (result) {
        onSuccess(result)
    } else {
        window.alert('Fnr må være 11 siffer')
    }
}

export function handterUuidValidering(
    input: string,
    onSuccess: (uuid: string) => void,
    onError?: () => void,
    errorMessage?: string,
) {
    const result = validerUuid(input)
    if (result) {
        onSuccess(result)
    } else {
        if (onError) {
            onError()
        }
        window.alert(errorMessage || 'ID må være en UUID på 36 tegn')
    }
}

export function handterIdentValidering(input: string, onSuccess: (ident: string) => void) {
    const result = validerIdent(input)
    if (result) {
        onSuccess(result)
    } else {
        window.alert('Ident må være 11 eller 13 siffer')
    }
}

export function validerFnr(input: string): string | null {
    let trimmed = input.trim()
    if (trimmed.length === 10) {
        trimmed = '0' + trimmed
    }
    if (trimmed.length === 11) {
        return trimmed
    }
    return null
}

export function validerUuid(input: string): string | null {
    const trimmed = input.trim()
    if (trimmed.length === 36) {
        return trimmed
    }
    return null
}

export function validerIdent(input: string): string | null {
    const trimmed = input.trim()
    if (trimmed.length === 11 || trimmed.length === 13) {
        return trimmed
    }
    return null
}
