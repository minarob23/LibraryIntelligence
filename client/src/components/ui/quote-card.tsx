import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Quote {
  id?: number;
  content: string;
  page?: number;
  chapter?: string;
  author?: string;
  tags?: string;
  isFavorite?: boolean;
}

interface QuoteCardProps {
  quote: Quote;
  onDelete?: (id: number | string) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onDelete,
}) => {
  const tags = quote.tags ? quote.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <Card className="relative group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-l-4 border-l-blue-500 dark:border-l-blue-400 overflow-hidden">
      <CardContent className="p-6">
        {/* Quote Mark Design */}
        <div className="absolute top-4 left-4 text-6xl text-blue-500/20 dark:text-blue-400/20 font-serif leading-none">
          "
        </div>

        {/* Delete Button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(quote.id || 0)}
            className="absolute top-3 right-3 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Quote Content */}
        <div className="relative z-10 mt-4">
          <blockquote className="text-gray-700 dark:text-gray-300 italic text-base leading-relaxed mb-4 pl-4">
            {quote.content}
          </blockquote>

          {/* Quote Footer */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {quote.page && (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  📖 Page {quote.page}
                </span>
              </div>
            )}

            {quote.chapter && (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  📑 {quote.chapter}
                </span>
              </div>
            )}

            {quote.author && (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  👤 {quote.author}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Decorative Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;