import { useOidcFetch } from "@axa-fr/react-oidc"
import { useEffect, useState } from "react"
import { USE_SSO } from "../config"
import { toast } from "react-toastify"

export const baseURL: string = import.meta.env.VITE_API_BASE_URL || ""

type FetchFunc = (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
) => Promise<Response>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dict = { [key: string]: any }

export const useFetch = <T>(url: string, params?: Dict): T | null => {
    const [ret, setRet] = useState<T | null>(null)

    const fetchFunc = USE_SSO
        ? useOidcFetch().fetch
        : ((input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init))

    useEffect(() => {
        apiGet(fetchFunc)<T>(url, params || {}).then(setRet)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return ret
}

export const useFetchArray = <T>(url: string, params?: Dict): T[] => {
    const [ret, setRet] = useState<T[]>([])

    const fetchFunc = USE_SSO
        ? useOidcFetch().fetch
        : ((input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init))

    useEffect(() => {
        apiGet(fetchFunc)<T[]>(url, params || {}).then(setRet)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return ret
}

export const useApi = () => {
    const fetchFunc = USE_SSO
        ? useOidcFetch().fetch
        : ((input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init))
    return {
        apiGet: apiGet(fetchFunc),
        apiPost: apiPostPutPatch(fetchFunc, "POST"),
        apiPut: apiPostPutPatch(fetchFunc, "PUT"),
        apiPatch: apiPostPutPatch(fetchFunc, "PATCH"),
        apiDelete: apiDelete(fetchFunc),
    }
}

// Can't name a method `get`, so ...
const apiGet =
    (fetch: FetchFunc) =>
    <T>(url: string, params?: Dict): Promise<T> => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        let qm = url.includes("?")
        for (const key in params || {}) {
            if (!qm) {
                url += "?"
                qm = true
            } else {
                url += "&"
            }
            url +=
                encodeURIComponent(key) + "=" + encodeURIComponent(params![key])
        }

        return fetch(baseURL + url)
            .then(body => {
                if (body.status >= 400) {
                    throw body
                }
                return body.json()
            })
            .then(e => e as T)
    }

const apiPostPutPatch =
    (fetch: FetchFunc, method: "POST" | "PUT" | "PATCH") =>
    (url: string, body?: Dict, params?: Dict): Promise<Response> => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        let qm = url.includes("?")
        for (const key in params || {}) {
            if (!qm) {
                url += "?"
                qm = true
            } else {
                url += "&"
            }
            url +=
                encodeURIComponent(key) + "=" + encodeURIComponent(params![key])
        }
        let describe: RequestInit = {
            method: method,
        }
        if (body) {
            describe = {
                ...describe,
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        }
        return fetch(baseURL + url, describe).then(response => {
            if (response.status >= 400) {
                throw response
            }
            return response
        })
    }

//can't name function `delete` 😞
const apiDelete =
    (fetch: FetchFunc) =>
    (url: string, params?: Dict): Promise<Response> => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        let qm = url.includes("?")
        for (const key in params || {}) {
            if (!qm) {
                url += "?"
                qm = true
            } else {
                url += "&"
            }
            url +=
                encodeURIComponent(key) + "=" + encodeURIComponent(params![key])
        }
        return fetch(baseURL + url, {
            method: "DELETE",
        }).then(response => {
            if (response.status >= 400) {
                throw response
            }
            return response
        })
    }

export const toastError = (message: string) => (err: Response) => {
    err.text().then(err =>
        toast.error(`${message}: ${err}`, {
            theme: "colored",
        })
    )
}
