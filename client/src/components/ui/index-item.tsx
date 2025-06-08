
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, GripVertical } from 'lucide-react';

interface IndexItem {
  id?: number;
  title: string;
  page?: number;
  level: number;
  order: number;
}

interface IndexItemProps {
  item: IndexItem;
  onEdit?: (item: IndexItem) => void;
  onDelete?: (id: number | string) => void;
}

const IndexItemCard: React.FC<IndexItemProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const levelIndent = (item.level - 1) * 20;

  return (
    <Card className="relative group hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          
          <div 
            className="flex-1 flex items-center justify-between"
            style={{ marginLeft: `${levelIndent}px` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.title}</span>
              {item.page && (
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  p. {item.page}
                </span>
              )}
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id || 0)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexItemCard;
