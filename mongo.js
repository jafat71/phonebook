const mongoose = require('mongoose')
const [, , password = "", name = "", number = ""] = process.argv

if (password === "") {
    console.log("You should type your password")
    process.exit(1)
}

const url =
    `mongodb+srv://user_jvza:${password}@cluster0.2qkvkx7.mongodb.net/phonebookDB`

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (name === "" || number === "") {
    mongoose.connect(url).catch(error => {
        console.log("Error connecting to db / Bad Password")
        process.exit(1)
    })
    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(person => {
            console.log(person.name + " " + person.number)
        })
        mongoose.connection.close()
    }).catch(error => console.log("Error retreiving Persons: " + error))

} else {

    mongoose.connect(url).catch(error => {
        console.log("Error connecting to db / Bad Password")
        process.exit(1)
    })

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(() => {
        console.log('added ' + name + " number " + number + " to phonebook")
        mongoose.connection.close()
    }).catch((error) => console.log("Error in saving new Person: " + error))

}