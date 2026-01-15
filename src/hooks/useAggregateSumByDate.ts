// hooks/useAggregateSumByDate.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client'; // tuo client tipizzato

interface AggregateParams {
  table_name: string;
  date_column: string;
  sum_column: string;
  granularity: 'monthly' | 'quarterly' | 'yearly';
  start_date: string; // 'YYYY-MM-DD'
  end_date: string;
}

interface AggregateData {
  period: string;
  total_sum: number;
}

export function useAggregateSumByDate(params: AggregateParams) {
  const supabase = createClient()
  return useQuery<AggregateData[]>({
    queryKey: ['aggregateSum', params],
    queryFn: async () => {
      console.log('🔄 Fetching aggregateSum:', params); // log params input
      
      const { data, error } = await supabase.rpc('get_aggregate_sum_by_date', {
        granularity: params.granularity,
        start_date: params.start_date,
        end_date: params.end_date,
        table_name: params.table_name,
        date_column: params.date_column,
        sum_column: params.sum_column,
      });
      
      if (error) {
        console.error('❌ RPC Error:', error);
        throw error;
      }
      
      console.log('✅ Aggregate data received:', data); // log risultato RPC
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache per dashboard
  });
}
