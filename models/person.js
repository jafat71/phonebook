require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url).catch(error => {
    console.log("Error connecting to db / Bad Password: " + error)
    process.exit(1)
})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: (value)=>{
                const phoneRegex = /^\d{2,3}-\d+$/;
                return phoneRegex.test(value);
            },
            message: "Phone Number not formatted correctly (min. 8 digits separated by -)"
        }
    },
})

const Person = mongoose.model('Person', personSchema)

personSchema.set('toJSON',{
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = Person