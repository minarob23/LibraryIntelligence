import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${getTrendBgColor(iconColor)} mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`mt-4 text-sm ${getTrendTextColor(change.trend)}`}>
            {change.trend === 'up' ? (
              <ArrowUp className="inline-block mr-1" size={16} />
            ) : (
              <ArrowDown className="inline-block mr-1" size={16} />
            )}
            {Math.abs(change.value)}% {change.text}
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