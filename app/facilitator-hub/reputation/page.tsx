import ReputationBoard from '@/components/ReputationBoard';

export default function ReputationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Facilitator Reputation
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transparent, on-chain reputation system for x402 facilitators using{' '}
            <a
              href="https://eips.ethereum.org/EIPS/eip-8004"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              ERC-8004
            </a>
          </p>
        </div>

        {/* Reputation Board */}
        <ReputationBoard />

        {/* Back to Hub */}
        <div className="mt-12 text-center">
          <a
            href="/facilitator-hub"
            className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition"
          >
            ← Back to Facilitator Hub
          </a>
        </div>
      </div>
    </div>
  );
}
