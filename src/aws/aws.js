const aws = require("aws-sdk");

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: "qGG1HE0qRixcW1T1Wg1bv+08tQrIkFVyDFqSft4J",
    region: "ap-south-1"
})
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "Group70/" + file.originalname, //HERE 
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            // console.log(data)
            // console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}

module.exports={uploadFile}
