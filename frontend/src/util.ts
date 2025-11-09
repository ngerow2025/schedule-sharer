import type { OidcUserInfo } from "@axa-fr/react-oidc"

export const isEboardOrRTP = (user: OidcUserInfo) =>
    ["eboard", "rtp"].filter(t => (user?.groups ?? []).includes(t)).length > 0

export const extractUsername = (s: string) => {
    if (/^[a-zA-Z0-9]{2,32}$/.test(s)) {
        return s
    } else if (/^.+\([a-zA-Z0-9]{2,32}\)$/.test(s)) {
        return s.split(/\(|\)/)[1]
    } else {
        return null
    }
}
