[**@chatkit/node**](../README.md)

***

[@chatkit/node](../README.md) / NonStreamingResult

# Class: NonStreamingResult

Defined in: src/server/results.ts:35

Non-streaming result that returns a JSON response.

## Constructors

### Constructor

> **new NonStreamingResult**(`data`): `NonStreamingResult`

Defined in: src/server/results.ts:39

#### Parameters

##### data

`unknown`

#### Returns

`NonStreamingResult`

## Properties

### isStreaming

> `readonly` **isStreaming**: `false` = `false`

Defined in: src/server/results.ts:36

## Methods

### toJSON()

> **toJSON**(): `unknown`

Defined in: src/server/results.ts:46

Get the response data as a JSON-serializable object.

#### Returns

`unknown`

***

### toString()

> **toString**(): `string`

Defined in: src/server/results.ts:53

Get the response data as a JSON string.

#### Returns

`string`
