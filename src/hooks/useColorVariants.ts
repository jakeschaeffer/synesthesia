import { useMemo } from 'react';
import { generateVariants } from '../utils/colorUtils';

export function useColorVariants(baseHex: string | null, count: number = 6): string[] {
  return useMemo(() => {
    if (!baseHex) return [];
    return generateVariants(baseHex, count);
  }, [baseHex, count]);
}
