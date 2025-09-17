'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Star, Gift, TrendingUp, Award, Calendar } from 'lucide-react';

export default function LoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    tier: 'Bronze',
    nextTier: 'Silver',
    pointsToNextTier: 0,
    totalEarned: 0,
    totalRedeemed: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [loyaltyRes, transactionsRes, rewardsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loyalty/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loyalty/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loyalty/rewards`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (loyaltyRes.ok) {
        const data = await loyaltyRes.json();
        setLoyaltyData(data);
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data);
      }

      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loyalty/redeem/${rewardId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Reward redeemed successfully!');
        await fetchLoyaltyData();
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-600 bg-amber-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Loyalty Program</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(loyaltyData.tier)} text-gray-800`}>
            {loyaltyData.tier} Member
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 mr-2" />
              <span className="text-3xl font-bold">{loyaltyData.points}</span>
            </div>
            <p className="text-orange-100">Available Points</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 mr-2" />
              <span className="text-3xl font-bold">{loyaltyData.totalEarned}</span>
            </div>
            <p className="text-orange-100">Total Earned</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Gift className="h-8 w-8 mr-2" />
              <span className="text-3xl font-bold">{loyaltyData.totalRedeemed}</span>
            </div>
            <p className="text-orange-100">Total Redeemed</p>
          </div>
        </div>

        {loyaltyData.nextTier && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span>Progress to {loyaltyData.nextTier}</span>
              <span>{loyaltyData.pointsToNextTier} points needed</span>
            </div>
            <div className="w-full bg-orange-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((loyaltyData.points) / (loyaltyData.points + loyaltyData.pointsToNextTier)) * 100))}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Available Rewards
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : rewards.length > 0 ? (
            <div className="space-y-4">
              {rewards.map((reward: any) => (
                <div key={reward.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{reward.name}</h3>
                    <span className="text-orange-600 font-semibold">{reward.pointsCost} pts</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <Button
                    size="sm"
                    onClick={() => redeemReward(reward.id)}
                    disabled={loyaltyData.points < reward.pointsCost}
                  >
                    {loyaltyData.points >= reward.pointsCost ? 'Redeem' : 'Insufficient Points'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No rewards available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Points History
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex justify-between items-center py-3">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction: any) => (
                <div key={transaction.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'EARNED' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'EARNED' ? '+' : '-'}{transaction.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">How to Earn Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium mb-2">Make Purchases</h3>
            <p className="text-sm text-gray-600">Earn 1 point for every KSh 100 spent</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Write Reviews</h3>
            <p className="text-sm text-gray-600">Get 50 points for each product review</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium mb-2">Refer Friends</h3>
            <p className="text-sm text-gray-600">Earn 500 points for each successful referral</p>
          </div>
        </div>
      </div>
    </div>
  );
}
