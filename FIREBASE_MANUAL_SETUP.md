# 🔥 Manual Firebase Setup (Web Console Method)

Since the CLI project creation is having issues, let's use the web console approach:

## 📍 **Step 1: Create Project via Web Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. **Project name**: `Business Lingo Bingo` (or any name you like)
4. **Project ID**: Will be auto-generated (note this down!)
5. **Analytics**: Enable or disable as you prefer
6. Click **"Create project"**

## 📍 **Step 2: Set Up Firestore Database**

1. In your new project, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. **Security rules**: Choose **"Start in test mode"** (we'll update rules later)
4. **Cloud Firestore location**: Choose closest to your users
5. Click **"Done"**

## 📍 **Step 3: Register Web App**

1. In project overview, click the **Web icon** (`</>`)
2. **App nickname**: `Business Lingo Bingo`
3. **Firebase Hosting**: Check this box ✅
4. Click **"Register app"**
5. **COPY** the configuration object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 📍 **Step 4: Update Your App**

Once you have the config, I'll help you:

1. **Update** `src/firebase/config.js` with your real config
2. **Connect** the CLI to your project
3. **Deploy** the firestore rules
4. **Test** the complete integration

## 🎯 **What to Share With Me:**

Just share your **projectId** from the config (e.g., `your-project-id`) and I'll handle the rest!

---

**This approach is more reliable than CLI project creation!** 🚀