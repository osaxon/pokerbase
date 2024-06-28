/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Rooms = "rooms",
	Squads = "squads",
	Stories = "stories",
	Users = "users",
	Votes = "votes",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type RoomsRecord = {
	name?: string
}

export type SquadsRecord = {
	members?: RecordIdString[]
	name?: string
}

export type StoriesRecord = {
	room?: RecordIdString
	title?: string
}

export enum UsersRoleOptions {
	"user" = "user",
	"super-user" = "super-user",
	"admin" = "admin",
}
export type UsersRecord = {
	avatar?: string
	name?: string
	role?: UsersRoleOptions
	squad?: RecordIdString
}

export enum VotesVoteOptions {
	"E0" = "0",
	"E1" = "1",
	"E2" = "2",
	"E3" = "3",
	"E5" = "5",
	"E8" = "8",
	"E13" = "13",
}
export type VotesRecord = {
	story?: RecordIdString
	user?: RecordIdString
	vote?: VotesVoteOptions
}

// Response types include system fields and match responses from the PocketBase API
export type RoomsResponse<Texpand = unknown> = Required<RoomsRecord> & BaseSystemFields<Texpand>
export type SquadsResponse<Texpand = unknown> = Required<SquadsRecord> & BaseSystemFields<Texpand>
export type StoriesResponse<Texpand = unknown> = Required<StoriesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VotesResponse<Texpand = unknown> = Required<VotesRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	rooms: RoomsRecord
	squads: SquadsRecord
	stories: StoriesRecord
	users: UsersRecord
	votes: VotesRecord
}

export type CollectionResponses = {
	rooms: RoomsResponse
	squads: SquadsResponse
	stories: StoriesResponse
	users: UsersResponse
	votes: VotesResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'rooms'): RecordService<RoomsResponse>
	collection(idOrName: 'squads'): RecordService<SquadsResponse>
	collection(idOrName: 'stories'): RecordService<StoriesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
	collection(idOrName: 'votes'): RecordService<VotesResponse>
}
