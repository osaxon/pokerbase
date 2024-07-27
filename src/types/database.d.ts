/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
export interface BaseCollectionResponse {
	/**
	 * 15 characters string to store as record ID.
	 */
	id: string;
	/**
	 * Date string representation for the creation date.
	 */
	created: string;
	/**
	 * Date string representation for the creation date.
	 */
	updated: string;
	/**
	 * The collection id.
	 */
	collectionId: string;
	/**
	 * The collection name.
	 */
	collectionName: string;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface BaseCollectionCreate {
	/**
	 * 15 characters string to store as record ID.
	 * If not set, it will be auto generated.
	 */
	id?: string;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface BaseCollectionUpdate {}

// https://pocketbase.io/docs/collections/#auth-collection
export interface AuthCollectionResponse extends BaseCollectionResponse {
	/**
	 * The username of the auth record.
	 */
	username: string;
	/**
	 * Auth record email address.
	 */
	email: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility: boolean;
	/**
	 * Indicates whether the auth record is verified or not.
	 */
	verified: boolean;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface AuthCollectionCreate extends BaseCollectionCreate {
	/**
	 * The username of the auth record.
	 * If not set, it will be auto generated.
	 */
	username?: string;
	/**
	 * Auth record email address.
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Auth record password.
	 */
	password: string;
	/**
	 * Auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface AuthCollectionUpdate {
	/**
	 * The username of the auth record.
	 */
	username?: string;
	/**
	 * The auth record email address.
	 * This field can be updated only by admins or auth records with "Manage" access.
	 * Regular accounts can update their email by calling "Request email change".
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Old auth record password.
	 * This field is required only when changing the record password. Admins and auth records with "Manage" access can skip this field.
	 */
	oldPassword?: string;
	/**
	 * New auth record password.
	 */
	password?: string;
	/**
	 * New auth record password confirmation.
	 */
	passwordConfirm?: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/collections/#view-collection
export interface ViewCollectionRecord {
	id: string;
}

// utilities

type MaybeArray<T> = T | T[];

// ===== users =====

export interface UsersResponse extends AuthCollectionResponse {
	collectionName: 'users';
	name: string;
	avatar: string;
	squad: string;
	role: '' | 'user' | 'super-user' | 'admin';
	rooms: Array<string>;
}

export interface UsersCreate extends AuthCollectionCreate {
	name?: string;
	avatar?: File | null;
	squad?: string;
	role?: '' | 'user' | 'super-user' | 'admin';
	rooms?: MaybeArray<string>;
}

export interface UsersUpdate extends AuthCollectionUpdate {
	name?: string;
	avatar?: File | null;
	squad?: string;
	role?: '' | 'user' | 'super-user' | 'admin';
	rooms?: MaybeArray<string>;
	'rooms+'?: MaybeArray<string>;
	'rooms-'?: MaybeArray<string>;
}

export interface UsersCollection {
	type: 'auth';
	collectionId: string;
	collectionName: 'users';
	response: UsersResponse;
	create: UsersCreate;
	update: UsersUpdate;
	relations: {
		squad: SquadsCollection;
		rooms: RoomsCollection[];
		'rooms(owner)': RoomsCollection[];
		'rooms(members)': RoomsCollection[];
		'squads(members)': SquadsCollection[];
		'votes(user)': VotesCollection[];
	};
}

// ===== rooms =====

export interface RoomsResponse extends BaseCollectionResponse {
	collectionName: 'rooms';
	name: string;
	squad: string;
	owner: string;
	stories: Array<string>;
	status: '' | 'open' | 'in progress' | 'completed';
	members: Array<string>;
	activeStory: string;
}

export interface RoomsCreate extends BaseCollectionCreate {
	name?: string;
	squad?: string;
	owner?: string;
	stories?: MaybeArray<string>;
	status?: '' | 'open' | 'in progress' | 'completed';
	members?: MaybeArray<string>;
	activeStory?: string;
}

export interface RoomsUpdate extends BaseCollectionUpdate {
	name?: string;
	squad?: string;
	owner?: string;
	stories?: MaybeArray<string>;
	'stories+'?: MaybeArray<string>;
	'stories-'?: MaybeArray<string>;
	status?: '' | 'open' | 'in progress' | 'completed';
	members?: MaybeArray<string>;
	'members+'?: MaybeArray<string>;
	'members-'?: MaybeArray<string>;
	activeStory?: string;
}

export interface RoomsCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'rooms';
	response: RoomsResponse;
	create: RoomsCreate;
	update: RoomsUpdate;
	relations: {
		'users(rooms)': UsersCollection[];
		squad: SquadsCollection;
		owner: UsersCollection;
		stories: StoriesCollection[];
		members: UsersCollection[];
		activeStory: StoriesCollection;
		'stories(room)': StoriesCollection[];
		'votes(room)': VotesCollection[];
	};
}

// ===== squads =====

export interface SquadsResponse extends BaseCollectionResponse {
	collectionName: 'squads';
	name: string;
	members: Array<string>;
}

export interface SquadsCreate extends BaseCollectionCreate {
	name?: string;
	members?: MaybeArray<string>;
}

export interface SquadsUpdate extends BaseCollectionUpdate {
	name?: string;
	members?: MaybeArray<string>;
	'members+'?: MaybeArray<string>;
	'members-'?: MaybeArray<string>;
}

export interface SquadsCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'squads';
	response: SquadsResponse;
	create: SquadsCreate;
	update: SquadsUpdate;
	relations: {
		'users(squad)': UsersCollection[];
		'rooms(squad)': RoomsCollection[];
		members: UsersCollection[];
	};
}

// ===== stories =====

export interface StoriesResponse extends BaseCollectionResponse {
	collectionName: 'stories';
	title: string;
	room: string;
	voted: boolean;
	points: number;
	status: '' | 'to estimate' | 'estimated';
}

export interface StoriesCreate extends BaseCollectionCreate {
	title?: string;
	room?: string;
	voted?: boolean;
	points?: number;
	status?: '' | 'to estimate' | 'estimated';
}

export interface StoriesUpdate extends BaseCollectionUpdate {
	title?: string;
	room?: string;
	voted?: boolean;
	points?: number;
	'points+'?: number;
	'points-'?: number;
	status?: '' | 'to estimate' | 'estimated';
}

export interface StoriesCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'stories';
	response: StoriesResponse;
	create: StoriesCreate;
	update: StoriesUpdate;
	relations: {
		'rooms(stories)': RoomsCollection[];
		'rooms(activeStory)': RoomsCollection[];
		room: RoomsCollection;
		'votes(story)': VotesCollection[];
	};
}

// ===== votes =====

export interface VotesResponse extends BaseCollectionResponse {
	collectionName: 'votes';
	story: string;
	user: string;
	vote: '' | '0' | '1' | '2' | '3' | '5' | '8' | '13';
	room: string;
}

export interface VotesCreate extends BaseCollectionCreate {
	story?: string;
	user?: string;
	vote?: '' | '0' | '1' | '2' | '3' | '5' | '8' | '13';
	room?: string;
}

export interface VotesUpdate extends BaseCollectionUpdate {
	story?: string;
	user?: string;
	vote?: '' | '0' | '1' | '2' | '3' | '5' | '8' | '13';
	room?: string;
}

export interface VotesCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'votes';
	response: VotesResponse;
	create: VotesCreate;
	update: VotesUpdate;
	relations: {
		story: StoriesCollection;
		user: UsersCollection;
		room: RoomsCollection;
	};
}

// ===== Schema =====

export type Schema = {
	users: UsersCollection;
	rooms: RoomsCollection;
	squads: SquadsCollection;
	stories: StoriesCollection;
	votes: VotesCollection;
};
