import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataService } from '../../lib/supabase';
import { GitCompare } from 'lucide-react';

export default function CompareRedirect() {
  const navigate = useNavigate();
  const dataService = useDataService();

  useEffect(() => {
    const redirect = async () => {
      const rfqs = await dataService.getRFQs();
      const comparingRfq = rfqs.find(r => r.status === 'COMPARING');
      if (comparingRfq) {
        navigate(`/officer/compare/${comparingRfq.id}`, { replace: true });
      } else {
        // No comparing RFQ, go to RFQ list
        navigate('/officer/rfqs', { replace: true });
      }
    };
    redirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-vendora-bg">
      <div className="text-center">
        <GitCompare className="w-12 h-12 text-vendora-amber mx-auto mb-4 animate-pulse" />
        <p className="text-vendora-muted font-body text-sm">Finding comparison...</p>
      </div>
    </div>
  );
}
