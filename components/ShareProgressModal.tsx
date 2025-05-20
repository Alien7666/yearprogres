import { useState, useRef, useEffect } from "react";

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function ShareProgressModal({
  isOpen,
  onClose,
  url,
}: ShareProgressModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.select();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand('copy');
        // 或使用現代 API
        await navigator.clipboard.writeText(url);
        setCopied(true);
        
        // 3秒後重置複製狀態
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">分享進度條</h2>
        <p className="mb-4">複製以下連結以分享您的自訂進度條：</p>
        
        <div className="flex mb-6">
          <input
            ref={inputRef}
            type="text"
            value={url}
            readOnly
            className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={handleCopy}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
          >
            {copied ? '已複製!' : '複製'}
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
