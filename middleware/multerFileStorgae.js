const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
    apiKey: "AIzaSyADIrcvyDs_dynV01t8Ce3pOD-SqF3vB-4",
    authDomain: "blog-4c349.firebaseapp.com",
    projectId: "blog-4c349",
    storageBucket: "blog-4c349.appspot.com",
    messagingSenderId: "942344848315",
    appId: "1:942344848315:web:9bde09e21770cb4e887a9e",
    measurementId: "G-JNYTQVTBQ6"
});

const storage = firebaseStorage.getStorage();
const uploadMulter = multer({ storage: multer.memoryStorage() });

const uploadToFierbase = async (file, userId, userType, fileType) => {
    try {

        let destinationPath

        if (userType === 'user' && fileType === 'profile') {
            destinationPath = `user/profile/${file.originalname}-${new Date().getTime()}`;
        } else if (userType === 'userpost' && fileType === 'bloimages') {
            destinationPath = `userpost/${userId}/bloimages/${file.originalname}-${new Date().getTime()}`;
        }

        const storageRef = firebaseStorage.ref(storage, destinationPath);
        const metadata = {
            contentType: file.mimetype,
        };

        const snapshot = await firebaseStorage.uploadBytes(
            storageRef,
            file.buffer,
            metadata
        );
        const downloadURL = await firebaseStorage.getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading to Firebase Storage:", error);
        throw error;
    }
};


const deleteFileFromFirebase = async (fileName) => {
    try {
        const storageRef = firebaseStorage.ref(storage, fileName);
        await firebaseStorage.deleteObject(storageRef);
    } catch (error) {
        throw error;
    }  
};

module.exports = {
    uploadToFierbase,
    uploadMulter,
    deleteFileFromFirebase,
};