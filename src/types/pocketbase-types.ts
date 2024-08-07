/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Rooms = "rooms",
	SquadMetrics = "squad_metrics",
	Squads = "squads",
	Stories = "stories",
	UserMetrics = "user_metrics",
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

export enum RoomsStatusOptions {
	"open" = "open",
	"in progress" = "in progress",
	"completed" = "completed",
}
export type RoomsRecord = {
	activeStory?: RecordIdString
	members?: RecordIdString[]
	name?: string
	owner?: RecordIdString
	squad?: RecordIdString
	status?: RoomsStatusOptions
	stories?: RecordIdString[]
}

export type SquadMetricsRecord<Tavg_score = unknown, Tmembers = unknown, Tname = unknown, Ttotal_stories = unknown> = {
	avg_score?: null | Tavg_score
	members?: null | Tmembers
	name?: null | Tname
	total_stories?: null | Ttotal_stories
}

export type SquadsRecord = {
	members?: RecordIdString[]
	name?: string
}

export enum StoriesStatusOptions {
	"to estimate" = "to estimate",
	"estimated" = "estimated",
}
export type StoriesRecord = {
	points?: number
	room?: RecordIdString
	status?: StoriesStatusOptions
	title?: string
	voted?: boolean
}

export type UserMetricsRecord<TAvScore = unknown> = {
	AvScore?: null | TAvScore
	user?: RecordIdString
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
	rooms?: RecordIdString[]
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
	room?: RecordIdString
	story?: RecordIdString
	user?: RecordIdString
	vote?: VotesVoteOptions
}

// Response types include system fields and match responses from the PocketBase API
export type RoomsResponse<Texpand = unknown> = Required<RoomsRecord> & BaseSystemFields<Texpand>
export type SquadMetricsResponse<Tavg_score = unknown, Tmembers = unknown, Tname = unknown, Ttotal_stories = unknown, Texpand = unknown> = Required<SquadMetricsRecord<Tavg_score, Tmembers, Tname, Ttotal_stories>> & BaseSystemFields<Texpand>
export type SquadsResponse<Texpand = unknown> = Required<SquadsRecord> & BaseSystemFields<Texpand>
export type StoriesResponse<Texpand = unknown> = Required<StoriesRecord> & BaseSystemFields<Texpand>
export type UserMetricsResponse<TAvScore = unknown, Texpand = unknown> = Required<UserMetricsRecord<TAvScore>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VotesResponse<Texpand = unknown> = Required<VotesRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	rooms: RoomsRecord
	squad_metrics: SquadMetricsRecord
	squads: SquadsRecord
	stories: StoriesRecord
	user_metrics: UserMetricsRecord
	users: UsersRecord
	votes: VotesRecord
}

export type CollectionResponses = {
	rooms: RoomsResponse
	squad_metrics: SquadMetricsResponse
	squads: SquadsResponse
	stories: StoriesResponse
	user_metrics: UserMetricsResponse
	users: UsersResponse
	votes: VotesResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'rooms'): RecordService<RoomsResponse>
	collection(idOrName: 'squad_metrics'): RecordService<SquadMetricsResponse>
	collection(idOrName: 'squads'): RecordService<SquadsResponse>
	collection(idOrName: 'stories'): RecordService<StoriesResponse>
	collection(idOrName: 'user_metrics'): RecordService<UserMetricsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
	collection(idOrName: 'votes'): RecordService<VotesResponse>
}
