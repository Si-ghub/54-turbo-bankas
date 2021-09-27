const helpers = {};

/**
 * Generuoja nurodyto ilgio atsitiktini teksta, kuriame galimi skaiciai.
 * @param {number} size Teksto simboliu kiekis.
 * @param {string} abc Naudotinu simboliu sarasas (teksto tipo).
 * @returns {string} Atsitiktinis tekstas.
 */
helpers.randomText = (size, abc = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789') => {
    const abcLength = abc.length;
    let str = '';
    for (let i = 0; i < size; i++) {
        const randomPosition = Math.floor(Math.random() * abcLength);
        str += abc[randomPosition];
    }
    return str;
}

/**
 * Generuoja nurodyto ilgio atsitiktini skaiciu.
 * @param {number} size Skaiciaus skaitmenu kiekis.
 * @returns {string} Atsitiktinis sveikasis skaicius teksto formate.
 */
helpers.randomInteger = (size) => {
    return helpers.randomText(size, '0123456789');
}

/**
 * Generuoja nurodyto ilgio atsitiktini teksta.
 * @param {number} size Teksto simboliu kiekis.
 * @returns {string} Atsitiktinis tekstas.
 */
helpers.randomLetters = (size) => {
    return helpers.randomText(size, 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm');
}

module.exports = helpers;