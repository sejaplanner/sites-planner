
import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ImagePreviewProps {
  file: File;
  onRemove?: () => void;
  showRemove?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove, showRemove = false }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative group">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src={imageUrl}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-3xl">
          <img
            src={imageUrl}
            alt={file.name}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          <p className="text-sm text-gray-600 mt-2 text-center">{file.name}</p>
        </DialogContent>
      </Dialog>
      
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default ImagePreview;
