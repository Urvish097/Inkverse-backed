const cron = require("node-cron");
const Advertisement = require("../Model/Advertisement/Advertisement");
const FilestorageFirabse = require("../middleware/multerFileStorgae")

const AdExprie = async () => {
    try {
        cron.schedule("0 * * * *", async () => {
            try {

                const expiredAds = await Advertisement.find({
                    lastTime: { $lte: new Date() },
                    paymentClear: true
                });

                expiredAds.forEach(async (ad) => {
                    const deleteimage = await Advertisement.findById(ad._id)

                    if (deleteimage.poster) {
                        await FilestorageFirabse.deleteFileFromFirebase(deleteimage.poster);
                    }

                    await Advertisement.findByIdAndDelete(ad._id)
                    console.log(`Ad ${ad._id}has been marked as expired.`);
                });

            } catch (error) {
                console.error("Error in cron job:", error.message);
            }
        });

    } catch (error) {
        console.log(error);
    }
};

module.exports = AdExprie;