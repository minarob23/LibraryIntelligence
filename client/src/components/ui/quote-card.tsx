
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  quote: string;
  book?: string;
  author?: string;
  className?: string;
}

const QuoteCard = ({ quote, book, author, className = '' }: QuoteCardProps) => {
  // Parse quote to extract actual quote and citation if provided
  const parseQuote = (rawQuote: string) => {
    const parts = rawQuote.split(' - ');
    const quoteText = parts[0].replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    const citation = parts.length > 1 ? parts.slice(1).join(' - ') : '';
    return { quoteText, citation };
  };

  const { quoteText, citation } = parseQuote(quote);

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-l-4 border-l-blue-500 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <blockquote className="text-gray-700 dark:text-gray-300 italic mb-2 leading-relaxed">
              "{quoteText}"
            </blockquote>
            <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
              {citation && (
                <span className="font-medium">{citation}</span>
              )}
              {book && (
                <span>from <em>{book}</em></span>
              )}
              {author && (
                <span>by {author}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
