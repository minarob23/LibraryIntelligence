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
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-2xl ${iconColor} bg-opacity-15 backdrop-blur-sm mb-6 transform hover:scale-110 transition-transform duration-300 shadow-inner`}>
            {icon}
          </div>
          <div className="space-y-4">
            <div className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent">
              {title}
            </div>
            <div className="text-3xl font-bold text-black dark:text-white">
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