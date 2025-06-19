import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface IndexItemProps {
  item: {
    id: number;
    title: string;
    page: string | number;
    level: number;
  };
  onUpdate: (id: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

const IndexItem: React.FC<IndexItemProps> = ({ item, onUpdate, onRemove }) => {
  return (
    <div className="flex items-center gap-2 p-2 border rounded">
      <Select
        value={item.level.toString()}
        onValueChange={(value) => onUpdate(item.id, 'level', parseInt(value))}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Chapter</SelectItem>
          <SelectItem value="1">Section</SelectItem>
          <SelectItem value="2">Subsection</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Title"
        value={item.title}
        onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
        className="flex-1"
      />

      <Input
        placeholder="Page"
        type="number"
        value={item.page}
        onChange={(e) => onUpdate(item.id, 'page', e.target.value)}
        className="w-20"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default IndexItem;