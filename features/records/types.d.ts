export type PossibleRecordValues = string | number | boolean | null | undefined;

export type BasetoolRecord<T = PossibleRecordValues> = Record<string, T>
