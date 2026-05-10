# Admin Application Integration Guide

To sync scholars with this application, your admin application should follow these steps:

## 1. Cloudinary Upload Configuration
Upload the scholar's image to Cloudinary using the following settings:
- **Cloud Name:** `dhlzcea1t`
- **Upload Preset:** `Masalah`

### Example Upload Function (React/JavaScript)
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'Masalah');

  const response = await fetch('https://api.cloudinary.com/v1_1/dhlzcea1t/image/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.secure_url;
};
```

## 2. Firestore Data Structure
Once the image is uploaded and you have the `secure_url`, save the scholar's data to Firestore.

- **Collection Path:** `/scholars`
- **Document Structure:**
```typescript
{
  name: string;          // Full name of the scholar
  description: string;   // Short description/biography
  phoneNumber: string;   // Contact number (e.g., "+880123456789")
  imageUrl: string;      // The URL returned from Cloudinary
  createdAt: Timestamp;  // firebase.firestore.FieldValue.serverTimestamp()
}
```

### Example Save Function (Firebase Web SDK v9+)
```javascript
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const saveScholar = async (scholar) => {
  await addDoc(collection(db, 'scholars'), {
    name: scholar.name,
    description: scholar.description,
    phoneNumber: scholar.phoneNumber,
    imageUrl: scholar.imageUrl,
    createdAt: serverTimestamp()
  });
};
```

## 3. Security Rules
The application's Firestore rules allow `create`, `update`, and `delete` only for users with Admin privileges. Ensure your admin application is authenticated with an account that has admin access.
