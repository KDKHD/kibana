import { AlertReference, LinkReference } from "."

export type ReferenceId = string

export type ReferenceTypes = "LinkReference" | 'AlertReference'

export type Reference = LinkReference | AlertReference