'use client';

import { useState, useEffect } from 'react';
import { Star, Gift, Clock, CheckCircle } from 'lucide-react';

interface LoyaltyStatus {
  loyaltyPoints: number;
  transactions: Array<{
    id: number;
    type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
    points: number;
    description: string;
    createdAt: string;
  }>;
  redemptions: Array<{
    id: number;
    status: string;
    redeemedAt: string;
    reward: {
      name: string;
      description: string;
      pointsCost: number;
    };
  }>;
}

interface LoyaltyProgram {
  id: number;
  name: string;
  description: string;
  rewards: Array<{
    id: number;
    name: string;
    description: string;
    pointsCost: number;
    rewardType: string;
    rewardValue: number;
  }>;
}

export default function LoyaltyDashboard() {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const [statusResponse, programsResponse] = await Promise.all([
        fetch('/api/customers/loyalty', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/customers/loyalty/programs', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setLoyaltyStatus(statusData);
      }

      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        setPrograms(programsData);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: number) => {
    try {
      const response = await fetch(`/api/customers/loyalty/redeem/${rewardId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        fetchLoyaltyData(); // Refresh data
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white rounded-lg shadow p-6 h-64"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Loyalty Points</h2>
            <p className="text-yellow-100">Earn points with every purchase</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-4xl font-bold">
              <Star className="w-10 h-10 mr-2" />
              {loyaltyStatus?.loyaltyPoints || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.flatMap(program => program.rewards).map((reward) => (
            <div key={reward.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <Gift className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-medium text-gray-500">
                  {reward.pointsCost} points
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mt-2">{reward.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
              <button
                onClick={() => redeemReward(reward.id)}
                disabled={(loyaltyStatus?.loyaltyPoints || 0) < reward.pointsCost}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {(loyaltyStatus?.loyaltyPoints || 0) >= reward.pointsCost ? 'Redeem' : 'Insufficient Points'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {loyaltyStatus?.transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                {transaction.type === 'EARNED' ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                transaction.points > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} points
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Redemptions */}
      {loyaltyStatus?.redemptions && loyaltyStatus.redemptions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Redemptions</h3>
          <div className="space-y-3">
            {loyaltyStatus.redemptions.map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{redemption.reward.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(redemption.redeemedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{redemption.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}