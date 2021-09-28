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

/**
 * Grazina visu vartotojo turimu banko saskaitu sarasa su jose esanciu balansu.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {number} userId Vartotojo ID.
 * @returns {Promise<Array|Error>} Vartotojo banko saskaitu sarasas.
 */
User.allAccountsBalance = async (connection, userId) => {
    if (!Valid.id(userId)) {
        return false;
    }

    const query = 'SELECT `account_number`, `money`\
                    FROM `accounts`\
                    WHERE `user_id` = '+ userId + '\
                        AND `isActive` = 1';
    try {
        const [rows] = await connection.execute(query);

        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        return error;
    }
}

/**
 * Vartotojo pasalinimas is banko sistemos.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {number} userId Vartotojo ID.
 * @returns {Promise<object|Error>} Istrinto vartotojo objektas.
 */
User.delete = async (connection, userId) => {
    if (!Valid.id(userId)) {
        return false;
    }

    const userAccounts = await User.allAccountsBalance(connection, userId);

    // jei bent vienoje vartotojo sasakaitoje yra pinigu
    // t.y. turi teigiama suma, arba skola
    // tai jo deaktyvuoti negalime
    if (userAccounts.some(account => account.money !== 0)) {
        return false;
    }

    // isActive -> 0
    const query = 'UPDATE `users`\
                    SET isActive = 0\
                    WHERE `id` = '+ userId;
    try {
        // saskaitu deaktyvavimas
        for (const account of userAccounts) {
            await Account.delete(connection, account.account_number);
        }

        // vartotojo deaktyvavimas
        const [response] = await connection.execute(query);

        if (response.affectedRows === 1 && response.changedRows === 1) {
            return {
                operation: 'delete_user',
                id: userId,
            }
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
}

module.exports = User;