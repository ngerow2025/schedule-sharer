import Storage from "./Storage"

export interface SearchParam {
    name: string
    param: string
    username: boolean
}

export const searchParams: SearchParam[] = [
    {
        param: "q",
        name: "Search Query",
        username: false,
    },
    {
        param: "involved",
        name: "Involved",
        username: true,
    },
    {
        param: "submitter",
        name: "Submitter",
        username: true,
    },
    {
        param: "speaker",
        name: "Speaker",
        username: true,
    },
    {
        param: "sort",
        name: "Sort",
        username: false,
    },
    {
        param: "sort_direction",
        name: "Sort Direction",
        username: false,
    },
]

export const assignParams = (dict: { [param: string]: string }) => {
    const href = new URL(window.location.href)
    for (const key in dict) {
        href.searchParams.set(key, dict[key])
    }
    window.location.assign(href)
}

export const deleteParams = (...params: string[]) => {
    const href = new URL(window.location.href)
    for (const key of params) {
        href.searchParams.delete(key)
    }
    window.location.assign(href)
}

export default Storage
