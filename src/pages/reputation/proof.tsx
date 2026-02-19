import type { NextPageWithLayout } from '@/types';
import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import Link from 'next/link';
import { useReputation } from '@/hooks/useReputation';
import { ProofGenerator } from '@/components/reputation/ProofGenerator';
import { ProofVerifier } from '@/components/reputation/ProofVerifier';

const ReputationProofPage: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const { reputation } = useReputation();
  const [activeTab, setActiveTab] = useState<'generate' | 'verify'>('generate');

  const storedRecord = publicKey
    ? localStorage.getItem(`zkpredict_reputation_record_${publicKey}`) ?? ''
    : '';

  return (
    <>
      <NextSeo
        title="Reputation Proofs - zkPredict"
        description="Generate and verify ZK reputation proofs on zkPredict"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/reputation" className="btn btn-ghost btn-sm btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              <span className="gradient-text-cyan">ZK Reputation Proofs</span>
            </h1>
            <p className="text-base-content/60 text-sm">Prove or verify reputation without exposing private stats</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'generate' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate Proof
          </button>
          <button
            className={`tab ${activeTab === 'verify' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Proof
          </button>
        </div>

        {activeTab === 'generate' ? (
          <>
            {!publicKey ? (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center py-12">
                  <p className="opacity-50">Connect your wallet to generate reputation proofs</p>
                </div>
              </div>
            ) : !reputation ? (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center py-12 space-y-3">
                  <p className="opacity-50">You need a Reputation record to generate proofs.</p>
                  <Link href="/reputation" className="btn btn-primary btn-sm">
                    Set Up Reputation
                  </Link>
                </div>
              </div>
            ) : (
              <ProofGenerator reputation={reputation} reputationRecord={storedRecord} />
            )}
          </>
        ) : (
          <ProofVerifier />
        )}

        {/* Info card */}
        <div className="card bg-base-200 border border-base-300 mt-6">
          <div className="card-body">
            <h3 className="font-bold text-sm">How ZK Reputation Proofs work</h3>
            <div className="space-y-2 text-xs opacity-70">
              <p>
                <strong>Generating:</strong> You create a proof by calling <code>prove_reputation</code> on-chain.
                The contract verifies your stats against your private Reputation record and issues a RepProof record.
              </p>
              <p>
                <strong>Sharing:</strong> Export the RepProof record from your wallet and share the JSON with anyone you want to prove your reputation to.
              </p>
              <p>
                <strong>Verifying:</strong> Anyone can paste a shared RepProof record to verify the claims. The proof only reveals what you chose to prove — nothing more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ReputationProofPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ReputationProofPage;
