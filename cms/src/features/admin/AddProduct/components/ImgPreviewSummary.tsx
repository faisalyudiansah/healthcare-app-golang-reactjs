import React, { useEffect, useState } from 'react';

const ImgPreviewSummary: React.FC<{ imgFile: File }> = ({ imgFile }) => {
  const [preview, setPreview] = useState<string | ArrayBuffer | null>();

  useEffect(() => {
    // PREFILL
    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onload = () => {
      const binaryStr = reader.result;

      setPreview(binaryStr);
    };

    reader.readAsDataURL(imgFile);
  }, [imgFile]);
  return (
    <div className="rounded-lg size-[200px]  bg-white">
      <img className="size-full object-cover" src={preview as string} alt="" />
    </div>
  );
};

export default ImgPreviewSummary;
