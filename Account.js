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
            operation: 'account_create',
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
                    WHERE `account_number` = "' + accountNumber + '"\
                        AND `isActive` = 1';
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
 * Vartotojo saskaitos aktyvumo statusas.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} accountNumber Vartotojo banko saskaitos numeris.
 * @returns {Promise<object|boolean|Error>} Saskaitos aktyvumo objektas.
 */
Account.isActive = async (connection, accountNumber) => {
    if (!Valid.accountNumber(accountNumber)) {
        return false;
    }

    const query = 'SELECT `isActive`\
                    FROM `accounts`\
                    WHERE `account_number` = "' + accountNumber + '"';
    try {
        const [rows] = await connection.execute(query);

        if (rows.length === 1) {
            return rows[0].isActive === 1 ? true : false;
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
}

/**
 * Vartotojo saskaitos uzdarymas.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} accountNumber Vartotojo banko saskaitos numeris.
 * @returns {Promise<object|boolean|Error>} Uzdarytos saskaitos objektas.
 */
Account.delete = async (connection, accountNumber) => {
    if (!Valid.accountNumber(accountNumber)) {
        return false;
    }

    const currentBalance = await Account.balance(connection, accountNumber);
    if (!Valid.money(currentBalance.money) ||
        currentBalance.money !== 0) {
        return false;
    }

    const query = 'UPDATE `accounts`\
                    SET `isActive` = 0\
                    WHERE `account_number` = "' + accountNumber + '"';
    try {
        const [response] = await connection.execute(query);
        if (response.affectedRows === 1 && response.changedRows === 1) {
            return {
                operation: 'account_delete',
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
                    WHERE `account_number` = "' + accountNumber + '"\
                        AND `isActive` = 1';
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
                    WHERE `account_number` = "' + accountNumber + '"\
                        AND `isActive` = 1';
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

/**
 * Pinigu pervedimas is vieno vartotojo nurodytos saskaitos i kito vartotojo nurodyta saskaita.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes mainpuliavimo metodus.
 * @param {string} senderAccountNumber Siunciancio vartotojo banko saskaitos numeris.
 * @param {string} receiverAccountNumber Gaunancio vartotojo banko saskaitos numeris.
 * @param {number} cashAmount Pervedamas pinigu sumos kiekis (centais).
 * @returns {Promise<object|boolean|Error>} Pinigu pervedimo objektas.
 */
Account.transfer = async (connection, senderAccountNumber, receiverAccountNumber, cashAmount) => {
    if (!Valid.accountNumber(senderAccountNumber) ||
        !Valid.accountNumber(receiverAccountNumber) ||
        !Valid.money(cashAmount)) {
        return false;
    }

    const receiverAccountIsActive = await Account.isActive(connection, receiverAccountNumber);
    if (!receiverAccountIsActive) {
        return false;
    }

    const currentBalance = await Account.balance(connection, senderAccountNumber);
    if (!Valid.money(currentBalance.money) ||
        currentBalance.money < cashAmount) {
        return false;
    }

    try {
        const withdrawResponse = await Account.withdraw(connection, senderAccountNumber, cashAmount);
        const depositResponse = await Account.deposit(connection, receiverAccountNumber, cashAmount);

        if (withdrawResponse !== false && depositResponse !== false) {
            return {
                operation: 'transfer',
                cashAmount,
                sender: senderAccountNumber,
                receiver: receiverAccountNumber,
            }
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
}

module.exports = Account;