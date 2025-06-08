
import QuoteCard from './quote-card';

interface QuotesDisplayProps {
  quotes: string;
  bookTitle?: string;
  bookAuthor?: string;
  className?: string;
}

const QuotesDisplay = ({ quotes, bookTitle, bookAuthor, className = '' }: QuotesDisplayProps) => {
  if (!quotes || quotes.trim() === '') {
    return (
      <div className={`text-center text-gray-500 dark:text-gray-400 py-8 ${className}`}>
        <p>No quotes available for this book yet.</p>
        <p className="text-sm mt-1">Add some memorable quotes to inspire future readers!</p>
      </div>
    );
  }

  // Split quotes by '---' separator
  const quoteList = quotes
    .split('---')
    .map(quote => quote.trim())
    .filter(quote => quote.length > 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {quoteList.map((quote, index) => (
        <QuoteCard
          key={index}
          quote={quote}
          book={bookTitle}
          author={bookAuthor}
        />
      ))}
    </div>
  );
};

export default QuotesDisplay;
