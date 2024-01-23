// ImageUpload.js
import { useState, useRef, useEffect } from 'react';

const ImageUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadBoxStyle, setUploadBoxStyle] = useState({
    border: '2px dashed #ccc',
    borderRadius: '5px',
    padding: '20px',
    marginBottom: '20px',
  });
  const fileInputRef = useRef(null);
  const [isDropzoneActive, setIsDropzoneActive] = useState(false);


  const handleDrop = (e) => {
    e.preventDefault();
    setIsDropzoneActive(false); // Reset dropzone style
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragEnter = () => {
    setIsDropzoneActive(true);
  };

  const handleDragLeave = () => {
    setIsDropzoneActive(false);
  };
  const handleFocus = () => {
    setIsDropzoneActive(true);
  };
  const handleBlur = () => {
    setIsDropzoneActive(false);
  };
  const handleClickOutside = (e) => {
    // Check if the click occurred outside the dropzone
    if (fileInputRef.current && !fileInputRef.current.contains(e.target)) {
      setIsDropzoneActive(false);
    }
  };
  useEffect(() => {
    // Attach the event listener when the component mounts
    document.body.addEventListener('click', handleClickOutside);

    // Detach the event listener when the component unmounts
    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, []);


  const handleFileSelection = (e) => {
    setIsDropzoneActive(true); // Set dropzone as active when a file is selected
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const updatedImages = [];

    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          // Display thumbnail for image files
          if (file.type.startsWith('image/')) {
            const image = new Image();
            image.src = e.target.result;

            // Ensure the image is loaded before resolving the promise
            image.onload = () => {
              updatedImages.push({
                file,
                thumbnail: e.target.result,
              });
              resolve();
            };
          } else {
            updatedImages.push({
              file,
              thumbnail: null,
            });
            resolve();
          }
        };

        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(() => {
      setSelectedImages(updatedImages);

      // Set border color based on file format
      const borderColor = updatedImages.every((image) =>
        image.file.type.startsWith('image/')
      )
        ? 'green'
        : 'red';

      setUploadBoxStyle({
        border: `2px dashed ${borderColor}`,
        borderRadius: '5px',
        padding: '20px',
        marginBottom: '20px',
      });
    });
  };

  const handleUpload = async () => {
    const formData = new FormData();
  
    selectedImages.forEach((image, index) => {
      formData.append(`image-${index + 1}`, image.file, image.file.name);
    });
  
    try {
      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
       
        credentials: 'include', // Include credentials if needed
      });
  
      if (response.ok) {
        console.log('Images uploaded successfully!');
        // Optionally, handle success behavior here
      } else {
        console.error('Failed to upload images');
        // Optionally, handle error behavior here
      }
    } catch (error) {
      console.error('Error uploading images', error);
      // Optionally, handle error behavior here
    }
  };
  

  const handleTextClick = () => {
    // Trigger the hidden file input when the text is clicked
    fileInputRef.current.click();
  };

  return (
    <div className='text-center'>
      <h1 className='text-[64px] font-bold' onClick={handleTextClick}>
        Hello
      </h1>
      <h2 className='font-medium p-4'> Upload your files here </h2>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          ...uploadBoxStyle,
          border: isDropzoneActive ? '2px dashed blue' : '2px dashed #ccc',
          padding: '40px',
          backgroundColor: '#f9f9f9',
        }}
        onClick={handleTextClick}
      >
        <p className='text-slate-300'>Drag 'n' drop some files here or click to select files</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelection}
          style={{ display: 'none' }}
          ref={fileInputRef}

        />
      </div>

      {selectedImages.length > 0 && (
        <div>
          <ul className='flex gap-2 grid-cols-8 '>
            {selectedImages.map((image, index) => (
              <li key={index}
                
              >
                {image.thumbnail && (
                  <img
                    src={image.thumbnail}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      display: 'inline-flex',
                      borderRadius: '2px',
                      border: '1px solid rgb(234, 234, 234)',
                      marginBottom: '8px',
                      marginRight: '8px',
                      width: '100px',
                      height: '100px',
                      padding: '4px',
                      boxSizing: 'border-box',
                    }}

                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleUpload} className='bg-slate-500 mt-2 hover:bg-slate-600 text-white  py-3 px-4 rounded'>Submit</button>
    </div>
  );
};

export default ImageUpload;
