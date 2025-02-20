const User = require('./models/User')
const Role = require('./models/Role')

class authController{
    async reg (req, res) {
        try{

        } catch (e){

        }
    }

    async log (req, res) {
        try{

        } catch (e){

        }

    }

    async getUsers (req, res) {
        try{
            const userRole = new Role()
            const adminRole = new Role({value:Admin})
            await userRole.save()
            await adminRole.save()

            res.json("server working")
        } catch (e){

        }

    }
}

module.exports = new authController()