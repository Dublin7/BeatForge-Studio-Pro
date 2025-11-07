import { useMutation } from '@tanstack/react-query';
import { BeatGeneratorParams, AIBeatResponse } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export function useBeatGenerator() {
  return useMutation({
    mutationFn: async (params: BeatGeneratorParams): Promise<AIBeatResponse> => {
      return await apiRequest<AIBeatResponse>(
        'POST',
        '/api/beats/generate',
        params
      );
    },
    onError: (error) => {
      console.error('Beat generation failed:', error);
    }
  });
}
