import { getApps, initializeApp } from 'firebase/app';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { readFileSync } from "node:fs";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID,
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  let firebaseApps = getApps();

  if (!firebaseApps.length) {
    initializeApp(firebaseConfig);
    firebaseApps = getApps(); // Refresh the list of apps after initialization
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const storage = getStorage();
    const fileKeys = Object.keys(files);

    if (!fileKeys.length) {
      return res.status(400).json({ error: 'No files provided for upload' });
    }

    const uploadPromises = fileKeys.map(async (key) => {
      const file = files[key];
      const filename = file[0].originalFilename
      const path = file[0]._writeStream.path

      if (!path) {
        console.error('File path is undefined');
        return;
      }

      const storageRef = ref(storage, `images/${filename}`);
      const fileStream = createReadStream(path);
      const fileData = readFileSync(path);
console.log(firebaseApps)
      // Wrap the upload process in a Promise to ensure it's completed before continuing
      await new Promise((resolve, reject) => {
        const uploadTask = uploadBytes(storageRef, fileData);


        uploadTask.then(
          () => {
            console.log('File uploaded successfully');
            resolve();  // Resolve the promise on successful upload
          },
          (error) => {
            console.error('Error during upload', error);
            resolve();  // Resolve the promise on successful upload

            // reject(error);  // Reject the promise on error
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      return res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
      console.error('Error uploading files', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};
