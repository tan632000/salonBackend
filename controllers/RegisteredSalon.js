const RegisteredSalon = require('../models/RegisteredSalon.js');

async function getRegisteredSalon(req, res) {
    try {
        const listRegisteredSalon = await RegisteredSalon.find();
        const listVerifySalon = listRegisteredSalon.filter(salon => salon.verified === true);
        res.json({ 
            success: true,
            payload: {
                totalRegistered: listRegisteredSalon.length,
                totalVerified: listVerifySalon.length,
                totalMoney: 1000000 * listVerifySalon.length
            }
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {
    getRegisteredSalon
}