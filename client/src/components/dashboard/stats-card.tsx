import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down';
    text: string;
  };
  iconColor?: string;
}

const StatsCard = ({
  title,
  value,
  icon,
  change,
  iconColor = 'text-primary-500 dark:text-primary-400'
}: StatsCardProps) => {
  return (
    <Card className="overflow-hidden border-2">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-xl ${iconColor} bg-opacity-15 backdrop-blur-sm mb-4`}>
            {icon}
          </div>
          <div className="space-y-3">
            <div className="text-lg font-semibold text-black dark:text-gray-100">
              {title}
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {value}
            </div>
          </div>
        </div>
        {change && (
          <div className="flex items-center mt-4 space-x-2 justify-center">
            {change.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <div
              className={`text-sm font-medium ${
                change.trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {change.value} {change.text}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions to get the trend colors
const getTrendBgColor = (iconColor: string) => {
  if (iconColor.includes('primary')) return 'bg-blue-100 dark:bg-blue-900/30';
  if (iconColor.includes('green')) return 'bg-green-100 dark:bg-green-900/30';
  if (iconColor.includes('purple')) return 'bg-purple-100 dark:bg-purple-900/30';
  if (iconColor.includes('yellow')) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-gray-100 dark:bg-gray-900/30';
};

const getTrendTextColor = (trend: 'up' | 'down') => {
  return trend === 'up' 
    ? 'text-green-500 dark:text-green-400' 
    : 'text-red-500 dark:text-red-400';
};

export default StatsCard;