class Valid {

    /**
     * Bendrinis metodas vardams validuoti
     * @param {string} text Vardas.
     * @param {number} maxLength Maksimalus vardo ilgis.
     * @returns {boolean} True/False ar validus vardas.
     */
    static name(text, maxLength = 50) {
        if (typeof text !== 'string' ||
            text === '' ||
            text.length > maxLength ||
            text[0] === text[0].toLowerCase() ||
            text.slice(1) !== text.slice(1).toLowerCase()) {
            return false;
        }
        return true;
    }

    /**
     * Bendrinis metodas vardams validuoti
     * @param {string} text Vardas.
     * @returns {boolean} True/False ar validus vardas.
     */
    static firstname(text) {
        return Valid.name(text, 15);
    }

    /**
     * Bendrinis metodas pavardems validuoti
     * @param {string} text Pavarde.
     * @returns {boolean} True/False ar validi pavarde.
     */
    static lastname(text) {
        return Valid.name(text, 30);
    }

    /**
     * Sveikasis skaicius.
     * @param {number} id Sveikasis skaicius.
     * @returns {boolean} True/False ar tai yra sveikasis skaicius.
     */
    static integer(n) {
        if (typeof n !== 'number' ||
            !isFinite(n) ||
            n % 1 !== 0) {
            return false;
        }
        return true;
    }

    /**
     * ID validavimas.
     * @param {number} id Sveikasis teigiamas skaicius, reprezentuojantis objekto ID.
     * @returns {boolean} True/False ar validus ID.
     */
    static id(id) {
        if (!Valid.integer(id) ||
            id <= 0) {
            return false;
        }
        return true;
    }

    /**
     * Tikriname, ar pinigu suma yra pateikta centu israiskoje.
     * @param {number} amount Pinigu kiekis.
     * @returns {boolean} True/False ar pinigu kiekis nurodytas teisingu formatu.
     */
    static money(amount) {
        if (!Valid.integer(amount) ||
            amount < 0) {
            return false;
        }
        return true;
    }

    /**
     * Tikraname, ar saskaitos numeris atitinka nurodyta formata/standarta.
     * @param {string} text Saskaitos numeris.
     * @returns {boolean} True/False ar saskaitos numeris yra validus.
     */
    static accountNumber(text) {
        const accountNumberPartLength = 18;
        const countryCode = text.slice(0, 2);
        const accNum = text.slice(2);

        let isOnlyIntegers = true;
        for (const num of accNum) {
            if (num !== (parseInt(num) + '')) {
                isOnlyIntegers = false;
                break;
            }
        }

        if (countryCode !== 'LT' ||
            accNum.length !== accountNumberPartLength ||
            !isOnlyIntegers) {
            return false;
        }
        return true;
    }
}

module.exports = Valid;