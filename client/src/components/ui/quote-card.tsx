
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Edit } from 'lucide-react';

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
  onEdit?: (quote: Quote) => void;
  onDelete?: (id: number | string) => void;
  onToggleFavorite?: (id: number | string) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const tags = quote.tags ? quote.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <blockquote className="text-sm italic text-gray-700 dark:text-gray-300 mb-2">
              "{quote.content}"
            </blockquote>
            
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              {quote.page && (
                <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  Page {quote.page}
                </span>
              )}
              {quote.chapter && (
                <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                  {quote.chapter}
                </span>
              )}
              {quote.author && (
                <span className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                  {quote.author}
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(quote.id || 0)}
                className="h-8 w-8 p-0"
              >
                <Heart
                  className={`h-4 w-4 ${
                    quote.isFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400'
                  }`}
                />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(quote)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(quote.id || 0)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
