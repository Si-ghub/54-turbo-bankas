const Account = require("./Account");
const Valid = require("./Valid");

const User = {};

/**
 * Vartotojo irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} firstname Vartotojo vardas.
 * @param {string} lastname Vartotojo pavarde.
 * @returns {Promise<object>} Vartotojo objektas.
 */
User.create = async (connection, firstname, lastname) => {
    if (!Valid.firstname(firstname) ||
        !Valid.lastname(lastname)) {
        return false;
    }

    const query = 'INSERT INTO `users`\
                    (`firstname`, `lastname`)\
                    VALUES ("'+ firstname + '", "' + lastname + '")';
    try {
        const [userResponse] = await connection.execute(query);
        const account = await Account.create(connection, userResponse.insertId);

        return {
            id: userResponse.insertId,
            firstname,
            lastname,
            accountNumber: account.accountNumber,
        }
    } catch (error) {
        return error;
    }
}

module.exports = User;