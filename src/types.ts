export type Person = {
  readonly id: string;
  readonly name: string;
};

export type AddNameResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'empty'
        | 'too_short'
        | 'invalid'
        | 'too_long'
        | 'duplicate'
        | 'limit';
    };

export type AddManyResult = {
  added: number;
  skippedDuplicate: number;
  skippedInvalid: number;
  skippedLimit: number;
};
