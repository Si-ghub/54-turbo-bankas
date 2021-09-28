const helpers = require("./helpers");
const Valid = require("./Valid");

const Account = {};

/**
 * Saskaitos irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {number} userId Vartotojo ID.
 * @returns {Promise<object|Error>} Saskaitos objektas.
 */
Account.create = async (connection, userId) => {
    if (!Valid.id(userId)) {
        return false;
    }

    const accountNumber = 'LT' + helpers.randomInteger(18);

    const query = 'INSERT INTO `accounts`\
                    (`user_id`, `account_number`)\
                    VALUES ("'+ userId + '", "' + accountNumber + '")';
    try {
        const [response] = await connection.execute(query);
        return {
            operation: 'create_account',
            id: response.insertId,
            accountNumber,
        }
    } catch (error) {
        return error;
    }
}

/**
 * Pinigu kiekis vartotojo nurodytoje saskaitoje.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} accountNumber Vartotojo banko saskaitos numeris.
 * @returns {Promise<object|boolean|Error>} Pinigu balanso objektas.
 */
Account.balance = async (connection, accountNumber) => {
    if (!Valid.accountNumber(accountNumber)) {
        return false;
    }

    const query = 'SELECT `money`\
                    FROM `accounts`\
                    WHERE `account_number` = "' + accountNumber + '"';
    try {
        const [rows] = await connection.execute(query);

        if (rows.length === 1) {
            return {
                operation: 'balance',
                money: rows[0].money
            };
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
}

/**
 * Pinigu inesimas i vartotojo nurodyta saskaita.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} accountNumber Vartotojo banko saskaitos numeris.
 * @param {number} cashAmount Inesamos pinigu sumos kiekis (centais).
* @returns {Promise<object|boolean|Error>} Pinigu inesimo objektas.
 */
Account.deposit = async (connection, accountNumber, cashAmount) => {
    if (!Valid.accountNumber(accountNumber) ||
        !Valid.money(cashAmount)) {
        return false;
    }

    const query = 'UPDATE `accounts`\
                    SET `money` = `money` + '+ cashAmount + '\
                    WHERE `account_number` = "' + accountNumber + '"';
    try {
        const [response] = await connection.execute(query);
        if (response.affectedRows === 1 && response.changedRows === 1) {
            return {
                operation: 'deposit',
                cashAmount,
                accountNumber,
            }
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
}

/**
 * Pinigu isigryninimas is vartotojo nurodytos saskaitos.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} accountNumber Vartotojo banko saskaitos numeris.
 * @param {number} cashAmount Isimamos pinigu sumos kiekis (centais).
 * @returns {Promise<object|boolean|Error>} Pinigu isnesimo objektas.
 */
Account.withdraw = async (connection, accountNumber, cashAmount) => {
    if (!Valid.accountNumber(accountNumber) ||
        !Valid.money(cashAmount)) {
        return false;
    }

    const currentBalance = await Account.balance(connection, accountNumber);
    if (!Valid.money(currentBalance.money) ||
        currentBalance.money < cashAmount) {
        return false;
    }

    const query = 'UPDATE `accounts`\
                    SET `money` = `money` - '+ cashAmount + '\
                    WHERE `account_number` = "' + accountNumber + '"';
    try {
        const [response] = await connection.execute(query);

        if (response.affectedRows === 1 && response.changedRows === 1) {
            return {
                operation: 'withdraw',
                cashAmount,
                accountNumber,
            }
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
}

module.exports = Account;