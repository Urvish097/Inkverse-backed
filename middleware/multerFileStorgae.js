const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
    apiKey: "AIzaSyDWjMavsiyBuKpxKSreh8Bw0niKBEOkcN4",
    authDomain: "blog-1e6ef.firebaseapp.com",
    projectId: "blog-1e6ef",
    storageBucket: "blog-1e6ef.appspot.com",
    messagingSenderId: "998178739197",
    appId: "1:998178739197:web:e45dad00fc8cbf1341bf94",
    measurementId: "G-ME1V913PDV"
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
        } else if (userType === 'Advertisement' && fileType === 'AdPoster') {
            destinationPath = `Advertisement/${userId}/AdPoster/${file.originalname}-${new Date().getTime()}`
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