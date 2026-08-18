import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { createId } from '../lib/createId';
import {
  isPersistablePerson,
  namesMatch,
  normalizeName,
  splitBulkNames,
  validateNormalizedName,
} from '../lib/nameRules';
import { MAX_NAMES } from '../theme';
import type { AddManyResult, AddNameResult, Person } from '../types';

const STORAGE_KEY = 'whos-paying.names';

function parsePeople(raw: string): Person[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const cleaned: Person[] = [];
    const seen: Set<string> = new Set();
    for (const entry of parsed) {
      if (!isPersistablePerson(entry)) {
        continue;
      }
      const name: string = normalizeName(entry.name);
      const key: string = name.toLocaleLowerCase();
      if (seen.has(key) || cleaned.length >= MAX_NAMES) {
        continue;
      }
      seen.add(key);
      cleaned.push({ id: entry.id, name });
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function useNames(): {
  names: Person[];
  ready: boolean;
  addName: (raw: string) => AddNameResult;
  addMany: (raw: string) => AddManyResult;
  removeName: (id: string) => void;
  clearNames: () => void;
} {
  const [names, setNames] = useState<Person[]>([]);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled: boolean = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw: string | null) => {
        if (cancelled || raw === null) {
          return;
        }
        setNames(parsePeople(raw));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(names)).catch(
      () => undefined,
    );
  }, [names, ready]);

  const addName = useCallback((raw: string): AddNameResult => {
    const name: string = normalizeName(raw);
    const validationError = validateNormalizedName(name);
    if (validationError !== null) {
      return { ok: false, reason: validationError };
    }
    const person: Person = { id: createId(), name };
    let result: AddNameResult = { ok: true };
    setNames((current: Person[]) => {
      if (current.some((entry: Person) => entry.id === person.id)) {
        return current;
      }
      if (current.length >= MAX_NAMES) {
        result = { ok: false, reason: 'limit' };
        return current;
      }
      const duplicate: boolean = current.some((entry: Person) =>
        namesMatch(entry.name, name),
      );
      if (duplicate) {
        result = { ok: false, reason: 'duplicate' };
        return current;
      }
      return [...current, person];
    });
    return result;
  }, []);

  const addMany = useCallback((raw: string): AddManyResult => {
    const parts: string[] = splitBulkNames(raw);
    const summary: AddManyResult = {
      added: 0,
      skippedDuplicate: 0,
      skippedInvalid: 0,
      skippedLimit: 0,
    };
    setNames((current: Person[]) => {
      const next: Person[] = [...current];
      const seen: Set<string> = new Set(
        next.map((entry: Person) => entry.name.toLocaleLowerCase()),
      );
      for (const part of parts) {
        const name: string = normalizeName(part);
        if (validateNormalizedName(name) !== null) {
          summary.skippedInvalid += 1;
          continue;
        }
        const key: string = name.toLocaleLowerCase();
        if (seen.has(key)) {
          summary.skippedDuplicate += 1;
          continue;
        }
        if (next.length >= MAX_NAMES) {
          summary.skippedLimit += 1;
          continue;
        }
        seen.add(key);
        next.push({ id: createId(), name });
        summary.added += 1;
      }
      return next;
    });
    return summary;
  }, []);

  const removeName = useCallback((id: string): void => {
    setNames((current: Person[]) =>
      current.filter((person: Person) => person.id !== id),
    );
  }, []);

  const clearNames = useCallback((): void => {
    setNames([]);
  }, []);

  return { names, ready, addName, addMany, removeName, clearNames };
}
