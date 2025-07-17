import { HourglassEmpty, EmojiEvents, Bolt } from '@mui/icons-material';

interface BiddingStageCardProps {
  stage: 1 | 2 | 3;
  elapsed: number;
  STAGE1: number;
  STAGE2: number;
  acceptPrice: number;
}

export function BiddingStageCard({ stage, elapsed, STAGE1, STAGE2, acceptPrice }: BiddingStageCardProps) {
  const remaining = (stage === 1 ? STAGE1 : STAGE2) - elapsed;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const percent = stage === 1 ? (elapsed / STAGE1) * 100 : ((elapsed - STAGE1) / (STAGE2 - STAGE1)) * 100;
  const stageColor = stage === 1 ? 'from-pink-400 to-blue-400' : stage === 2 ? 'from-blue-400 to-yellow-300' : 'from-yellow-400 to-pink-400';
  const stageIcon = stage === 1 ? <HourglassEmpty className="text-pink-400" fontSize="large" /> : stage === 2 ? <EmojiEvents className="text-blue-400" fontSize="large" /> : <Bolt className="text-yellow-400" fontSize="large" />;
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white/80 rounded-2xl shadow-2xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        {stageIcon}
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-blue-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
          Wave {stage} Bidding
        </h2>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className={`h-full transition-all duration-500 bg-gradient-to-r ${stageColor}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <p className="text-lg font-semibold text-gray-700">
          {stage === 1
            ? 'Tier‐A providers within 3 km'
            : stage === 2
            ? 'Tier‐B providers within 10 km'
            : 'All providers'}
        </p>
        <div className="flex items-center gap-2 text-4xl font-mono font-bold text-blue-600">
          <HourglassEmpty className="animate-spin" />
          {mm}:{ss}
        </div>
        <p className="text-gray-600 text-base">
          <strong>Accept Price:</strong> ${acceptPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
} 