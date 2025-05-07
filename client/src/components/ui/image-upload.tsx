import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import coverImage1 from '../../assets/book-covers/cover1.svg';
import coverImage2 from '../../assets/book-covers/cover2.svg';
import coverImage3 from '../../assets/book-covers/cover3.svg';
import coverImage4 from '../../assets/book-covers/cover4.svg';
import coverImage5 from '../../assets/book-covers/cover5.svg';
import coverImage6 from '../../assets/book-covers/cover6.svg';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const predefinedCovers = [
  { src: coverImage1, alt: "Cover 1" },
  { src: coverImage2, alt: "Cover 2" },
  { src: coverImage3, alt: "Cover 3" },
  { src: coverImage4, alt: "Cover 4" },
  { src: coverImage5, alt: "Cover 5" },
  { src: coverImage6, alt: "Cover 6" }
];

const ImageUpload = ({ value, onChange, label }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUrlInput, setIsUrlInput] = useState(true);
  
  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    onChange('');
  };
  
  const handleSelectPredefined = (src: string) => {
    setPreview(src);
    onChange(src);
  };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      
      <div className="flex flex-wrap gap-2 mb-3">
        {predefinedCovers.map((cover, index) => (
          <div 
            key={index} 
            onClick={() => handleSelectPredefined(cover.src)}
            className={`cursor-pointer border-2 rounded-md w-16 h-24 flex items-center justify-center overflow-hidden 
                      ${preview === cover.src ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <img src={cover.src} alt={cover.alt} className="max-w-full max-h-full object-cover" />
          </div>
        ))}
      </div>
      
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto max-h-[200px] object-contain" 
            />
            <button 
              type="button" 
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload a cover image or provide a URL</p>
          </div>
        )}
        
        <div className="mt-4">
          <div className="flex space-x-2 mb-2">
            <Button 
              type="button" 
              variant={isUrlInput ? "outline" : "default"} 
              size="sm"
              className="flex-1"
              onClick={() => setIsUrlInput(false)}
            >
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
            <Button 
              type="button" 
              variant={isUrlInput ? "default" : "outline"} 
              size="sm"
              className="flex-1"
              onClick={() => setIsUrlInput(true)}
            >
              URL
            </Button>
          </div>
          
          {isUrlInput ? (
            <input 
              type="text" 
              placeholder="Enter image URL" 
              className="form-input w-full"
              value={value}
              onChange={handleUrlChange}
            />
          ) : (
            <div>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" /> Select Image
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;